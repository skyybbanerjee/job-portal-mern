import Company from "../models/companyModel.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import Job from "../models/JobModel.js";
import JobApplication from "../models/jobApplicationModel.js";

//Register a new company
export async function registerCompany(req, res) {
  const { name, email, password } = req.body;
  const imageFile = req.file;
  if (!name || !email || !password || !imageFile) {
    return res
      .status(400)
      .json({ success: false, message: "Missing details 🔴" });
  }

  try {
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Company already registered!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
    });

    res.json({
      success: true,
      message: "Company registered successfully!",
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

//Company login
export async function loginCompany(req, res) {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ email });
    if (company) {
      const isMatch = await bcrypt.compare(password, company.password);
      if (isMatch) {
        res.json({
          success: true,
          message: "Company logged in successfully!",
          company: {
            _id: company._id,
            name: company.name,
            email: company.email,
            image: company.image,
          },
          token: generateToken(company._id),
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials (email/password)!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

//Get company-data
export async function getCompanyData(req, res) {
  try {
    const company = req.company;
    res.json({ success: true, company });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

//Post a new job
export async function postJob(req, res) {
  const { title, description, location, salary, level, category } = req.body;
  const companyId = req.company._id;
  try {
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      companyId,
      date: Date.now(),
      level,
      category,
    });
    await newJob.save();
    res.json({
      success: true,
      message: "Job posted successfully!",
      job: newJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

//Get company job-applicants
// export async function getCompanyJobApplicants(req, res) {
//   try {
//     const companyId = req.company._id;
//     // Find job applications for the user and populate related area
//     const applications = await JobApplication.find({ companyId })
//       .populate("userId", "name image resume")
//       .populate("jobId", "title location category level salary")
//       .exec();
//     return res.json({ success: true, applications });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

export async function getCompanyJobApplicants(req, res) {
  try {
    const companyId = req.company._id;
    const applications = await JobApplication.find({ companyId })
      .populate("userId", "name image resume")
      .populate("jobId", "title location")
      .exec();
      console.log("Company ID:", req.company._id);
      console.log("Applications:", applications);


    res.json({
      success: true,
      applications: applications || [], // Ensure applications is always an array.
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

//Get company posted jobs
export async function getCompanyPostedJobs(req, res) {
  try {
    const companyId = req.company._id;
    const jobs = await Job.find({ companyId });
    //todo: Adding No. of applicants info in data
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });
        return {
          ...job.toObject(),
          applicants: applicants.length,
        };
      })
    );
    res.status(200).json({ success: true, jobsData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

//Change Job Application Status
export async function changeJobApplicationStatus(req, res) {
  try {
    const { id, status } = req.body;
    //Find Job Application data and update status
    await JobApplication.findOneAndUpdate({ _id: id }, { status });
    res.status(200).json({
      success: true,
      message: "Job Application status updated successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//Change job visibility
export async function changeVisibility(req, res) {
  try {
    const { id } = req.body;
    const companyId = req.company._id;
    const job = await Job.findById(id);
    if (companyId.toString() === job.companyId.toString()) {
      job.visible = !job.visible; //acting as toggle f(x)
    }
    await job.save();
    res.status(200).json({ success: true, job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
