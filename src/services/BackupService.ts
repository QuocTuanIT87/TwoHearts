import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleDriveService } from "./GoogleDriveService";

const LAST_BACKUP_DATE_KEY = "@fireheart_last_backup_date";
const BACKGROUND_TASK_NAME = "FIREHEART_AUTO_BACKUP";

export const BackupService = {
  /**
   * Run the check and execute backup if needed.
   * Target: Daily backup after 3:00 AM.
   */
  async checkAndRunBackup(isManual = false): Promise<boolean> {
    try {
      const now = new Date();
      const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      if (!isManual) {
        // Enforce the 3:00 AM rule. Only backup if past 3 AM today.
        const currentHour = now.getHours();
        if (currentHour < 3) {
          return false; // Too early for today's backup
        }

        const lastBackupDate = await AsyncStorage.getItem(LAST_BACKUP_DATE_KEY);
        if (lastBackupDate === todayString) {
          return false; // Today's backup already completed
        }
      }

      // Check if Google Drive is connected first
      const googleLoggedIn = await GoogleDriveService.isLoggedIn();
      if (!googleLoggedIn) {
        if (isManual) {
          throw new Error("Chưa kết nối tài khoản Google Drive. Vui lòng đăng nhập trong mục Cài đặt trước.");
        }
        console.log("Auto backup skipped: Google Drive is not connected.");
        return false;
      }

      // Perform backup (uploads encrypted tables to Google Drive)
      await GoogleDriveService.performBackup();

      // Store today as the last backup date
      await AsyncStorage.setItem(LAST_BACKUP_DATE_KEY, todayString);
      return true;
    } catch (error) {
      console.error("Auto backup check failed:", error);
      return false;
    }
  },

  /**
   * Registers the background fetch task to trigger automated backups.
   */
  async registerBackgroundTask(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
      if (!isRegistered) {
        // Run background task check. Minimum interval is in minutes (60 minutes = 1 hour)
        await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 60, // Check hourly
        });
        console.log("Background backup task registered successfully.");
      }
    } catch (error) {
      console.warn("Could not register background backup task:", error);
    }
  },
};

// Define the background task for Expo TaskManager
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const backupExecuted = await BackupService.checkAndRunBackup(false);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("Background task execution error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
