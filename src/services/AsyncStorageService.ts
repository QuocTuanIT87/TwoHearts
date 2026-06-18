import AsyncStorage from "@react-native-async-storage/async-storage";
import { encrypt, decrypt } from "../utils/encryption";

// Keys used in AsyncStorage
const KEYS = {
  HISTORY: "@fireheart_history_v1",
  TYPES: "@fireheart_types_v1",
  USERS: "@fireheart_users_v1",
};

// Types definition
export interface DateHistory {
  id: string;
  time: string; // ISO 8601
  type: string; // Type name or ID
  note: string;
  imageList: string[]; // Google Drive links / local paths
  reason: string;
}

export interface DateType {
  id: string;
  name: string;
  deleteAt?: string | null;
}

export interface DateUser {
  id: string; // 'user_1' or 'user_2'
  name: string;
  phone: string;
  facebook: string;
  tiktok: string;
  interest: string[];
  dislike: string[];
  hate: string[];
  height: number;
  weight: number;
  birthday: string; // YYYY-MM-DD
  gender: "Nam" | "Nữ";
  shoeSize?: string;
  shirtSize?: string;
  avatar?: string;
}

export interface DateStartTime {
  acquaintedDay: string; // ngày 29/9/2025 16:00
  confessionDay: string; // ngày 1/1/2026 21:30
}

// Fixed milestones, read-only
const DATE_START_TIME: DateStartTime = {
  acquaintedDay: "2025-09-29T16:00:00+07:00",
  confessionDay: "2026-01-01T21:30:00+07:00",
};

// Default Date Types to seed on first run
const DEFAULT_DATE_TYPES: DateType[] = [
  { id: "type_1", name: "Đi ăn uống 🍽️" },
  { id: "type_2", name: "Xem phim 🎬" },
  { id: "type_3", name: "Đi dạo phố 🚶‍♂️🚶‍♀️" },
  { id: "type_4", name: "Cà phê trò chuyện ☕" },
  { id: "type_5", name: "Du lịch nghỉ dưỡng ✈️" },
];

/**
 * Generic function to get and decrypt data from AsyncStorage
 */
async function getEncryptedItem<T>(key: string): Promise<T | null> {
  try {
    const rawVal = await AsyncStorage.getItem(key);
    if (!rawVal) return null;
    const decryptedStr = decrypt(rawVal);
    if (!decryptedStr) return null;
    return JSON.parse(decryptedStr) as T;
  } catch (error) {
    console.error(`Error reading key ${key}:`, error);
    return null;
  }
}

/**
 * Generic function to encrypt and save data to AsyncStorage
 */
async function setEncryptedItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonStr = JSON.stringify(value);
    const encryptedStr = encrypt(jsonStr);
    await AsyncStorage.setItem(key, encryptedStr);
  } catch (error) {
    console.error(`Error saving key ${key}:`, error);
    throw error;
  }
}

export const AsyncStorageService = {
  // --- Start Milestones ---
  getStartTime(): DateStartTime {
    return DATE_START_TIME;
  },

  // --- DateUser Operations ---
  async getUsers(): Promise<DateUser[]> {
    const users = await getEncryptedItem<DateUser[]>(KEYS.USERS);
    return users || [];
  },

  async saveUsers(user1: DateUser, user2: DateUser): Promise<void> {
    // Force specific IDs for consistent 2-user layout
    const formattedUser1 = { ...user1, id: "user_1" };
    const formattedUser2 = { ...user2, id: "user_2" };
    await setEncryptedItem<DateUser[]>(KEYS.USERS, [formattedUser1, formattedUser2]);
  },

  // --- DateType Operations ---
  async getTypes(includeArchived = false): Promise<DateType[]> {
    let types = await getEncryptedItem<DateType[]>(KEYS.TYPES);
    if (types === null) {
      // Seed default types
      await setEncryptedItem<DateType[]>(KEYS.TYPES, DEFAULT_DATE_TYPES);
      types = DEFAULT_DATE_TYPES;
    }
    if (!includeArchived) {
      return types.filter(t => !t.deleteAt);
    }
    return types;
  },

  async saveTypes(types: DateType[]): Promise<void> {
    await setEncryptedItem<DateType[]>(KEYS.TYPES, types);
  },

  async addType(name: string): Promise<DateType> {
    const types = await this.getTypes(true);
    
    // Check if there is an archived category with the same name (case-insensitive)
    const archivedIndex = types.findIndex(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase() && t.deleteAt
    );
    
    if (archivedIndex !== -1) {
      // Restore it
      types[archivedIndex].deleteAt = null;
      await this.saveTypes(types);
      return types[archivedIndex];
    }

    // Check if there is an active category with the same name, to avoid duplication
    const activeExist = types.find(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase() && !t.deleteAt
    );
    if (activeExist) {
      return activeExist;
    }

    const newType: DateType = {
      id: `type_${Date.now()}`,
      name: name.trim(),
      deleteAt: null,
    };
    types.push(newType);
    await this.saveTypes(types);
    return newType;
  },

  async updateType(id: string, newName: string): Promise<void> {
    const types = await this.getTypes(true);
    const index = types.findIndex((t) => t.id === id);
    if (index !== -1) {
      types[index].name = newName.trim();
      await this.saveTypes(types);
    }
  },

  async deleteType(id: string): Promise<void> {
    const types = await this.getTypes(true);
    const targetType = types.find((t) => t.id === id);
    if (!targetType) return;

    const history = await this.getHistory();
    const isLinked = history.some(
      (h) => h.type.toLowerCase() === targetType.name.toLowerCase()
    );

    let updatedTypes: DateType[];
    if (isLinked) {
      // Archive it: set deleteAt to the current date/time
      updatedTypes = types.map((t) => {
        if (t.id === id) {
          return { ...t, deleteAt: new Date().toISOString() };
        }
        return t;
      });
    } else {
      // Delete completely
      updatedTypes = types.filter((t) => t.id !== id);
    }

    await this.saveTypes(updatedTypes);
  },

  // --- DateHistory Operations ---
  async getHistory(): Promise<DateHistory[]> {
    const history = await getEncryptedItem<DateHistory[]>(KEYS.HISTORY);
    return history || [];
  },

  async saveHistoryList(history: DateHistory[]): Promise<void> {
    await setEncryptedItem<DateHistory[]>(KEYS.HISTORY, history);
  },

  async addHistoryItem(item: Omit<DateHistory, "id">): Promise<DateHistory> {
    const history = await this.getHistory();
    const newItem: DateHistory = {
      ...item,
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    history.unshift(newItem); // New events at the top
    await this.saveHistoryList(history);
    return newItem;
  },

  async updateHistoryItem(id: string, updatedFields: Partial<Omit<DateHistory, "id">>): Promise<void> {
    const history = await this.getHistory();
    const index = history.findIndex((h) => h.id === id);
    if (index === -1) {
      throw new Error("Không tìm thấy sự kiện cần cập nhật.");
    }

    const currentItem = history[index];

    // Merge modifications
    history[index] = {
      ...currentItem,
      ...updatedFields,
    };
    await this.saveHistoryList(history);
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const history = await this.getHistory();
    const index = history.findIndex((h) => h.id === id);
    if (index === -1) {
      throw new Error("Không tìm thấy sự kiện cần xóa.");
    }

    const currentItem = history[index];

    const filtered = history.filter((h) => h.id !== id);
    await this.saveHistoryList(filtered);
  },

  // --- Clear & Import ---
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.HISTORY);
    await AsyncStorage.removeItem(KEYS.TYPES);
    await AsyncStorage.removeItem(KEYS.USERS);
  },

  /**
   * Imports raw database tables, used for restoration.
   */
  async importRawBackup(data: { history: DateHistory[]; types: DateType[]; users: DateUser[] }): Promise<void> {
    if (data.users && data.users.length === 2) {
      await setEncryptedItem<DateUser[]>(KEYS.USERS, data.users);
    } else {
      throw new Error("Dữ liệu sao lưu không chứa đúng 2 người dùng.");
    }

    if (data.types) {
      await setEncryptedItem<DateType[]>(KEYS.TYPES, data.types);
    }
    if (data.history) {
      await setEncryptedItem<DateHistory[]>(KEYS.HISTORY, data.history);
    }
  },

  /**
   * Exports raw database tables as JSON, used for backup creation.
   */
  async exportRawBackup(): Promise<{ history: DateHistory[]; types: DateType[]; users: DateUser[] }> {
    const history = await this.getHistory();
    const types = await this.getTypes(true);
    const users = await this.getUsers();

    return {
      history,
      types,
      users,
    };
  },
};
