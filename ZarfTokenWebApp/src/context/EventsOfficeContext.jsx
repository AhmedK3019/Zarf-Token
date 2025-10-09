import { createContext, useState, useMemo, useCallback } from "react";

const EventsOfficeContext = createContext(null);

const EventsOfficeProvider = ({ children }) => {
  const [eventsOffice, setEventsOffice] = useState(null);
  const loginEventsOffice = useCallback((eventsOfficeData) => {
    setEventsOffice(eventsOfficeData);
  }, []);
  const logoutEventsOffice = useCallback(() => {
    setEventsOffice(null);
  }, []);

  const value = useMemo(
    () => ({
      eventsOffice,
      loginEventsOffice,
      logoutEventsOffice,
    }),
    [eventsOffice, loginEventsOffice, logoutEventsOffice]
  );
  return (
    <EventsOfficeContext.Provider value={value}>
      {children}
    </EventsOfficeContext.Provider>
  );
};

export { EventsOfficeContext, EventsOfficeProvider };
