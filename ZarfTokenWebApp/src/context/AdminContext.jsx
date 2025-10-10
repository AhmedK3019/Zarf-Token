import { createContext, useState, useCallback, useMemo } from "react";
const AdminContext = createContext(null);

const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);

  const loginAdmin = useCallback((adminData) => {
    setAdmin(adminData);
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdmin(null);
  }, []);
  const value = useMemo(
    () => ({
      admin,
      loginAdmin,
      logoutAdmin,
    }),
    [admin, loginAdmin, logoutAdmin]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export { AdminContext, AdminProvider };
