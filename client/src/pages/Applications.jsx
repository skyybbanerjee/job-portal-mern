import React, { useContext, useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { assets } from "../assets/assets";
import moment from "moment";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";

const Applications = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);

  const { backendUrl, userData, userApplications, fetchUsersData, fetchUserApplications } =
    useContext(AppContext);

  const { user } = useUser();
  const {getToken}  = useAuth();

  async function updateResume() {
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/users/update-resume`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        await fetchUsersData();
        toast.success(data.message);
        setIsEdit(false); // Switch back to non-edit mode
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setResume(null);
    }
  }

  useEffect(()=>{
    if(user){
      fetchUserApplications();
    }
  },[user])

  console.log("userApplications from Applications.jsx: ", userApplications);
  return (
    <>
      <NavBar />
      <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
        <h2 className="text-xl font-semibold">Your Resume</h2>
        <div className="flex gap-2 mb-6 mt-3">
          {isEdit || (userData && !userData.resume) ? (
            <>
              <label className="flex items-center" htmlFor="resumeUpload">
                <p className="bg-blue-100 cursor-pointer hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg mr-2">
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(evt) => setResume(evt.target.files[0])}
                  id="resumeUpload"
                />
                <img
                  src={assets.profile_upload_icon}
                  alt="profile_upload_icon"
                />
              </label>
              <button
                onClick={updateResume}
                className="bg-green-100 hover:bg-green-200 border border-green-400 rounded-lg px-4 py-2">
                Save
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <a
                className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-4 py-2 rounded-lg"
                href={userData?.resume || "#"}
                target="_blank"
                rel="noopener noreferrer">
                View Resume
              </a>
              <button
                onClick={() => setIsEdit(true)}
                className="text-gray-500 border hover:text-gray-900 border-gray-300 rounded-lg px-4 py-2">
                Edit
              </button>
            </div>
          )}
        </div>
        <h2 className="text-xl font-semibold mb-4">Jobs Applied</h2>
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-left">Company</th>
              <th className="py-3 px-4 border-b text-left">Job Title</th>
              <th className="py-3 px-4 border-b text-left max-sm:hidden">
                Location
              </th>
              <th className="py-3 px-4 border-b text-left max-sm:hidden">
                Date
              </th>
              <th className="py-3 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {userApplications.map((job, idx) =>
              true ? (
                <tr key={idx}>
                  <td className="py-3 px-4 flex items-center gap-2 border-b">
                    <img
                      className="w-8 h-8"
                      src={job.companyId.image}
                      alt="job-logo"
                    />
                    {job.companyId.name}
                  </td>
                  <td className="py-2 px-4 border-b">{job.jobId.title}</td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {job.jobId.location}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {moment(job.date).format("ll")}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    <span
                      className={`${
                        job.status === "Accepted"
                          ? "bg-green-100"
                          : job.status === "Rejected"
                          ? "bg-red-100"
                          : "bg-blue-100"
                      } px-4 py-1.5 rounded`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
};

export default Applications;
