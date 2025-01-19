import JobApplication from "../models/jobApplicationModel.js";
import Job from "../models/JobModel.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";

// Get user data
export async function getUserData(req, res) {
  const userId = req.auth.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Apply For A Job
export async function applyForJob(req, res) {
  const { jobId } = req.body;
  const userId = req.auth.userId;
  try {
    const isAlreadyAppplied = await JobApplication.find({ jobId, userId });
    if (isAlreadyAppplied.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }
    const jobData = await Job.findById(jobId);
    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now(),
    });
    res.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

// Get User Applied Applications
export async function getUserJobApplications(req, res) {
  try {
    const userId = req.auth.userId;
    const applications = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title description location category level salary")
      .exec();
    if (!applications) {
      return res.status(404).json({
        success: false,
        message: "No job-applications found for this user!",
      });
    }
    res.json({ success: true, applications });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Update User Profile
export async function updateUserResume(req, res) {
  try {
    const userId = req.auth.userId;
    const resumeFile = req.file;
    const userData = await User.findById(userId);
    if (resumeFile) {
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path);
      userData.resume = resumeUpload.secure_url;
    }
    await userData.save();
    res.json({ success: true, message: "Resume updated successfully✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
