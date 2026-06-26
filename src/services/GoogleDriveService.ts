import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as FileSystem from "expo-file-system/legacy";
import { decrypt, encrypt } from "../utils/encryption";
import { AsyncStorageService } from "./AsyncStorageService";

export const GOOGLE_CLIENT_ID = "765227702920-caeghllgauea96583eircrrtuv2gvcpj.apps.googleusercontent.com"; // Điền Google Client ID (Web Client ID) của bạn tại đây

const GOOGLE_TOKEN_KEY = "@fireheart_google_token";

export interface GoogleUser {
  email: string;
  name: string;
  avatar?: string;
}

export interface BackupFile {
  id: string;          // File ID in Drive, or local URI
  name: string;        // Filename
  createdTime: string; // ISO 8601 string
}

export const GoogleDriveService = {
  // --- Client ID configuration ---
  async getClientId(): Promise<string> {
    return GOOGLE_CLIENT_ID;
  },

  // --- Google OAuth Configuration ---
  async configureGoogleSignIn(): Promise<void> {
    const clientId = await this.getClientId();
    if (clientId) {
      GoogleSignin.configure({
        webClientId: clientId,
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });
    }
  },

  // --- Google OAuth ---
  async getAccessToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(GOOGLE_TOKEN_KEY);
      if (!token) return null;

      // Try silently refreshing the token if configured and signed in
      const clientId = await this.getClientId();
      if (clientId) {
        await this.configureGoogleSignIn();
        const hasPrevious = GoogleSignin.hasPreviousSignIn();
        if (hasPrevious) {
          const tokens = await GoogleSignin.getTokens();
          if (tokens.accessToken) {
            await this.saveAccessToken(tokens.accessToken);
            return tokens.accessToken;
          }
        }
      }
      return token;
    } catch (error) {
      console.warn("Silent signin / token refresh failed:", error);
      return await AsyncStorage.getItem(GOOGLE_TOKEN_KEY);
    }
  },

  async saveAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(GOOGLE_TOKEN_KEY, token);
  },

  async logoutGoogle(): Promise<void> {
    await AsyncStorage.removeItem(GOOGLE_TOKEN_KEY);
    try {
      const clientId = await this.getClientId();
      if (clientId) {
        await this.configureGoogleSignIn();
        await GoogleSignin.signOut();
      }
    } catch (e) {
      console.warn("Google Signin signOut failed:", e);
    }
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },

  /**
   * Performs real Google Signin and saves access token.
   */
  async loginGoogle(): Promise<GoogleUser> {
    const clientId = await this.getClientId();
    if (!clientId) {
      throw new Error("Vui lòng điền GOOGLE_CLIENT_ID trong file src/services/GoogleDriveService.ts trước khi đăng nhập.");
    }

    await this.configureGoogleSignIn();
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type !== "success") {
      throw new Error("Đăng nhập Google bị hủy hoặc thất bại.");
    }
    const userInfo = response.data;
    const tokens = await GoogleSignin.getTokens();

    if (!tokens.accessToken) {
      throw new Error("Không thể lấy Access Token từ Google Sign-In.");
    }

    await this.saveAccessToken(tokens.accessToken);

    return {
      email: userInfo.user.email,
      name: userInfo.user.name || "Người dùng Google",
      avatar: userInfo.user.photo || undefined,
    };
  },

  /**
   * Fetches logged in user details from Google userinfo endpoint or Native client
   */
  async getGoogleUserInfo(): Promise<GoogleUser | null> {
    try {
      const clientId = await this.getClientId();
      if (clientId) {
        await this.configureGoogleSignIn();
        const hasPrevious = GoogleSignin.hasPreviousSignIn();
        if (hasPrevious) {
          const userInfo = GoogleSignin.getCurrentUser();
          if (userInfo) {
            return {
              email: userInfo.user.email,
              name: userInfo.user.name || "Người dùng Google",
              avatar: userInfo.user.photo || undefined,
            };
          }
        }
      }

      const token = await this.getAccessToken();
      if (!token) return null;

      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        return {
          email: data.email || "",
          name: data.name || "",
          avatar: data.picture || undefined,
        };
      }
    } catch (error) {
      console.error("Failed to fetch Google profile:", error);
    }
    return null;
  },

  // --- Image Upload Operation ---
  /**
   * Uploads an image file to Google Drive.
   * Creates a folder structure: DateDiaryData -> DateDiaryPicture -> "today" (YYYY-MM-DD) and pushes the image there.
   * Returns the accessible URL/URI of the uploaded image.
   */
  async uploadImage(localUri: string): Promise<string> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Chưa kết nối tài khoản Google Drive. Vui lòng đăng nhập trong mục Cài đặt trước.");

    const now = new Date();
    const timestamp = Math.floor(now.getTime() / 1000);
    const fileName = `date_diary_utc_${timestamp}.jpg`;

    // 1. Check or create folder structure in Google Drive
    const rootFolderId = await this.getOrCreateDriveFolder("DateDiaryData", token);
    const pictureRootFolderId = await this.getOrCreateDriveFolder("DateDiaryPicture", token, rootFolderId);

    // 2. Upload file directly to DateDiaryPicture
    const fileId = await this.uploadToDrive(localUri, fileName, "image/jpeg", pictureRootFolderId, token);

    // 3. Return a web-viewable URL (Google Drive direct embed pattern)
    return `https://lh3.googleusercontent.com/d/${fileId}=s800`;
  },

  async findFileInFolder(fileName: string, folderId: string): Promise<string | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    const query = `name = '${fileName}' and '${folderId}' in parents and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }
    return null;
  },

  async uploadAvatar(localUri: string, gender: "Nam" | "Nữ"): Promise<string> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Chưa kết nối tài khoản Google Drive. Vui lòng đăng nhập trong mục Cài đặt trước.");

    // 1. Get or create root structure
    const rootFolderId = await this.getOrCreateDriveFolder("DateDiaryData", token);
    const pictureRootFolderId = await this.getOrCreateDriveFolder("DateDiaryPicture", token, rootFolderId);
    const profileFolderId = await this.getOrCreateDriveFolder("Profile", token, pictureRootFolderId);

    const fileName = gender === "Nam" ? "boy_avatar.jpg" : "girl_avatar.jpg";

    // 2. Check if old avatar exists, and delete it to overwrite
    const oldFileId = await this.findFileInFolder(fileName, profileFolderId);
    if (oldFileId) {
      try {
        await this.deleteFile(oldFileId);
      } catch (err) {
        console.warn("Failed to delete old profile avatar:", err);
      }
    }

    // 3. Upload new avatar directly to Profile folder
    const fileId = await this.uploadToDrive(localUri, fileName, "image/jpeg", profileFolderId, token);

    // 4. Return the public CDN URL
    return `https://lh3.googleusercontent.com/d/${fileId}=s800`;
  },

  // --- Backup Operation ---
  /**
   * Encrypts and uploads all database tables into a backup text file in Google Drive folder "DateDiaryData/DateDiaryBackup".
   * Enforces retention rules: if total backups count = 20, delete 17 oldest files (keeping only 3 newest).
   */
  async performBackup(): Promise<string> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Chưa kết nối tài khoản Google Drive. Vui lòng đăng nhập trong mục Cài đặt trước.");

    // 1. Prepare backup payload (raw database tables JSON)
    const backupData = await AsyncStorageService.exportRawBackup();
    const rawJson = JSON.stringify(backupData, null, 2);

    // 2. Save backup file with .json extension
    const dateFormatted = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const fileName = `backup_${dateFormatted}.json`;

    // 3. Get or create parent folder "DateDiaryBackup" under "DateDiaryData"
    const rootFolderId = await this.getOrCreateDriveFolder("DateDiaryData", token);
    const parentFolderId = await this.getOrCreateDriveFolder("DateDiaryBackup", token, rootFolderId);

    // 4. Upload backup file
    await this.uploadTextToDrive(rawJson, fileName, parentFolderId, token);

    // 5. Enforce cloud retention
    await this.pruneBackups();
    return fileName;
  },

  // --- List Backups ---
  async listBackups(): Promise<BackupFile[]> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Chưa kết nối tài khoản Google Drive. Vui lòng đăng nhập trong mục Cài đặt trước.");

    const rootFolderId = await this.getOrCreateDriveFolder("DateDiaryData", token);
    const parentFolderId = await this.getOrCreateDriveFolder("DateDiaryBackup", token, rootFolderId);
    const query = `name contains 'backup_' and name contains '.json' and '${parentFolderId}' in parents and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        query
      )}&orderBy=createdTime desc&fields=files(id,name,createdTime)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Không thể tải danh sách sao lưu từ Google Drive.");
    }

    const data = await response.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
    }));
  },

  // --- Prune Backup Retention (Limit to 3 newest if total is 20) ---
  async pruneBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      if (backups.length >= 20) {
        // Keep 3 newest, delete the rest (oldest 17)
        const toDelete = backups.slice(3);
        const token = await this.getAccessToken();
        if (!token) return;

        for (const item of toDelete) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${item.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
    } catch (error) {
      console.error("Failed to prune old backups:", error);
    }
  },

  // --- Restore Operation ---
  /**
   * Downloads, decrypts, and restores the database tables from a backup file.
   */
  async restoreBackup(backupIdOrUri: string): Promise<void> {
    let encryptedContent = "";

    // Check if it's a local picked URI or a remote Drive ID
    if (
      backupIdOrUri.startsWith("file://") ||
      backupIdOrUri.startsWith("content://") ||
      backupIdOrUri.includes("/") ||
      backupIdOrUri.includes("\\")
    ) {
      const fileInfo = await FileSystem.getInfoAsync(backupIdOrUri);
      if (!fileInfo.exists) throw new Error("Không tìm thấy file sao lưu trên máy.");
      encryptedContent = await FileSystem.readAsStringAsync(backupIdOrUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } else {
      const token = await this.getAccessToken();
      if (!token) throw new Error("Chưa kết nối tài khoản Google Drive. Vui lòng đăng nhập trong mục Cài đặt trước.");

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${backupIdOrUri}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Không thể tải file sao lưu từ Google Drive.");
      }
      encryptedContent = await response.text();
    }

    if (!encryptedContent) throw new Error("Nội dung file trống.");

    // Decrypt using key "MayTrangSatsBoy"
    const decryptedJson = decrypt(encryptedContent);
    if (!decryptedJson) throw new Error("Mã hóa sai hoặc file bị hỏng.");

    const parsed = JSON.parse(decryptedJson);
    if (!parsed.tables) throw new Error("Cấu trúc file sao lưu không hợp lệ.");

    // Import tables back to database
    await AsyncStorageService.importRawBackup(parsed.tables);
  },

  // --- Helper Methods for Google Drive API ---

  async getOrCreateDriveFolder(folderName: string, token: string, parentId?: string): Promise<string> {
    // Check if exists
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }
    const checkRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create if not exists
    const body: any = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (parentId) {
      body.parents = [parentId];
    }

    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!createRes.ok) {
      throw new Error(`Không thể tạo thư mục ${folderName} trên Google Drive.`);
    }

    const data = await createRes.json();
    return data.id;
  },

  async uploadToDrive(localUri: string, fileName: string, mimeType: string, folderId: string, token: string): Promise<string> {
    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    const boundary = "foo_bar_boundary";

    const base64Content = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    let multipartBody = `--${boundary}\r\n`;
    multipartBody += `Content-Type: application/json; charset=UTF-8\r\n\r\n`;
    multipartBody += `${JSON.stringify(metadata)}\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Type: ${mimeType}\r\n`;
    multipartBody += `Content-Transfer-Encoding: base64\r\n\r\n`;
    multipartBody += `${base64Content}\r\n`;
    multipartBody += `--${boundary}--`;

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Drive upload failed:", err);
      throw new Error(`Upload file ảnh lên Drive thất bại.`);
    }

    const data = await res.json();

    // Make file viewable publically so client Image components can retrieve it
    await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    });

    return data.id;
  },

  async uploadTextToDrive(content: string, fileName: string, folderId: string, token: string): Promise<void> {
    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    const boundary = "foo_bar_boundary_txt";
    let multipartBody = `--${boundary}\r\n`;
    multipartBody += `Content-Type: application/json; charset=UTF-8\r\n\r\n`;
    multipartBody += `${JSON.stringify(metadata)}\r\n`;
    multipartBody += `--${boundary}\r\n`;
    multipartBody += `Content-Type: text/plain\r\n\r\n`;
    multipartBody += `${content}\r\n`;
    multipartBody += `--${boundary}--`;

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Backup file upload failed:", err);
      throw new Error(`Upload file sao lưu lên Drive thất bại.`);
    }
  },

  async deleteFile(fileId: string): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) throw new Error("Chưa kết nối tài khoản Google Drive.");

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errMsg = await res.text();
      console.warn(`Failed to delete file ${fileId} from Drive:`, errMsg);
    }
  },

  getFileIdFromUrl(url: string): string | null {
    // Pattern: https://lh3.googleusercontent.com/d/[FILE_ID]=s800
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  },
};
