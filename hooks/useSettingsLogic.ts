// hooks/useSettingsLogic.ts
import { useState, useEffect, useRef, useCallback } from "react";

export function useSettingsLogic() {
  const [language, setLanguage] = useState("EN");
  const [isDeepSpace, setIsDeepSpace] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSocialAccount, setIsSocialAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", text: "" });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function checkUserSecurity() {
      try {
        const res = await fetch("/api/get-user");
        const data = await res.json();
        if (data.success && data.user) {
          setIsSocialAccount(data.user.provider !== "credentials");
          if (data.user.email) setUserEmail(data.user.email);
        }
      } catch (error) {
        console.error("Security check failed:", error);
      }
    }
    checkUserSecurity();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordStatus({ type: "error", text: "New passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordStatus({ type: "success", text: "Access keys updated!" });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswords({ current: "", new: "", confirm: "" });
          setPasswordStatus({ type: "", text: "" });
        }, 2000);
      } else {
        setPasswordStatus({ type: "error", text: data.message });
      }
    } catch {
      setPasswordStatus({ type: "error", text: "Connection failure" });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDeleteModalOpen(false);
    setCountdown(5);
    setIsDeleting(false);
  }, []);

  const handleFinalDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/deleteGalaxy", { method: "POST" });
      if (response.ok) window.location.reload();
      else cancelDelete();
    } catch {
      cancelDelete();
    }
  }, [cancelDelete]);

  useEffect(() => {
    if (isDeleteModalOpen && countdown > 0 && !isDeleting) {
      timerRef.current = setInterval(
        () => setCountdown((prev) => prev - 1),
        1000
      );
    } else if (countdown === 0 && !isDeleting) {
      handleFinalDelete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isDeleteModalOpen, countdown, isDeleting, handleFinalDelete]);

  return {
    language,
    setLanguage,
    isDeepSpace,
    setIsDeepSpace,
    loading,
    isSocialAccount,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    passwords,
    setPasswords,
    passwordStatus,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    countdown,
    handleUpdatePassword,
    cancelDelete,
  };
}
export type SettingsLogicType = ReturnType<typeof useSettingsLogic>;
