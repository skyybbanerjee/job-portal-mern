import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useUser();
  const { getToken } = useAuth();

  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [companyToken, setCompanyToken] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userApplications, setUserApplications] = useState([]);

  async function fetchJobs() {
    try {
      const { data } = await axios.get(`${backendUrl}/api/jobs`);
      setJobs(data.success ? data.jobs : []);
      if (!data.success) toast.error(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to fetch jobs.");
    }
  }

  async function fetchUsersData() {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(data.success ? data.user : null);
      if (!data.success) toast.error(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to fetch user data.");
    }
  }

  async function fetchUserApplications() {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserApplications(data.success ? data.applications : []);
      if (!data.success) toast.error(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to fetch applications.");
    }
  }

  async function fetchCompanyData() {
    try {
      if (!companyToken) return;
      const { data } = await axios.get(`${backendUrl}/api/company/company`, {
        headers: { token: companyToken },
      });
      setCompanyData(data.success ? data.company : null);
      if (!data.success) toast.error(data.message);
    } catch (error) {
      toast.error(error.message || "Failed to fetch company data.");
    }
  }

  useEffect(() => {
    fetchJobs();
    const storedToken = localStorage.getItem("companyToken");
    if (storedToken) setCompanyToken(storedToken);
  }, []);



  useEffect(() => {
    if (companyToken) fetchCompanyData();
  }, [companyToken]);

  useEffect(() => {
    if (user) {
      fetchUsersData();
      fetchUserApplications();
    }
  }, [user]);

  const ctxtValue = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    companyToken,
    setCompanyToken,
    companyData,
    backendUrl,
    userData,
    userApplications,
    fetchUsersData,
    fetchCompanyData,
    fetchJobs,
    fetchUserApplications,
    user,
  };

  return (
    <AppContext.Provider value={ctxtValue}>
      {props.children}
    </AppContext.Provider>
  );
};
