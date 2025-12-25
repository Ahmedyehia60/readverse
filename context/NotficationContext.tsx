"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface INotification {
  id: string;
  type: "smart-link" | "achievement";
  title: string;
  message: string;
  bookTitle?: string;
  bookImage?: string;
  categories?: [string, string];
  isRead: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: INotification[];
  addNotification: (
    notification: Omit<INotification, "id" | "isRead" | "createdAt">
  ) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExistingNotifications = async () => {
      try {
        const response = await fetch("/api/books");
        if (response.ok) {
          const data = await response.json();
          if (data.notifications) {
            const sorted = data.notifications.sort(
              (a: INotification, b: INotification) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
            setNotifications(sorted);
          }
        }
      } catch (error) {
        console.error("Failed to sync notifications with DB:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingNotifications();
  }, []);
  const addNotification = (
    note: Omit<INotification, "id" | "isRead" | "createdAt">
  ) => {
    const newNotification: INotification = {
      ...note,
      id: Math.random().toString(36).substring(7),
      isRead: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/books", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_READ" }),
      });
    } catch (error) {
      console.error("Failed to sync read status:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllAsRead,
        unreadCount,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
