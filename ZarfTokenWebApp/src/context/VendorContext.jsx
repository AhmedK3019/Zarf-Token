import { createContext, useState, useMemo, useCallback } from "react";
const VendorContext = createContext(null);

const VendorProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);

  const loginVendor = useCallback((vendordata) => {
    setVendor(vendordata);
  }, []);

  const logoutVendor = useCallback(() => {
    setVendor(null);
  }, []);

  const value = useMemo(
    () => ({ vendor, loginVendor, logoutVendor }),
    [vendor, loginVendor, logoutVendor]
  );

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
};

export { VendorContext, VendorProvider };
