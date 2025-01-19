import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations } from "../assets/assets";
import JobCard from "./JobCard";

function JobListing() {
  const { isSearched, searchFilter, setSearchFilter, jobs } =
    useContext(AppContext); // all from src/context/AppContext.jsx
  const [showFilter, setShowFilter] = useState(true); //for showing/hiding FILTER on mobile devices
  const [currentPage, setCurrentPage] = useState(1); //for pagination
  const [selectedCategories, setSelectedCategories] = useState([]); //filters and checkboxes
  const [selectedLocations, setSelectedLocations] = useState([]); //filters and checkboxes

  const [filteredJobs, setFilteredJobs] = useState(jobs);

  function handleCategoryChange(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }

  function handleLocationChange(location) {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  }

  useEffect(() => {
    //applying different filters acc. to selected categories
    const matchesCategory = (job) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(job.category);

    const matchesLocation = (job) =>
      selectedLocations.length === 0 ||
      selectedLocations.includes(job.location);

    const matchesTitle = (job) =>
      searchFilter.title === "" ||
      job.title.toLowerCase().includes(searchFilter.title.toLowerCase());

    const matchesSearchedLocation = (job) =>
      searchFilter.location === "" ||
      job.location.toLowerCase().includes(searchFilter.location.toLowerCase());

    //final filtered data
    const newFilteredJobs = jobs
      .slice()
      .reverse()
      .filter(
        (job) =>
          matchesCategory(job) &&
          matchesLocation(job) &&
          matchesTitle(job) &&
          matchesSearchedLocation(job)
      );

    setFilteredJobs(newFilteredJobs);
    setCurrentPage(1); //resetting page to 1 when filters change
  }, [jobs, selectedCategories, selectedLocations, searchFilter]);

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
      {/* SIDEBAR */}
      <div className="w-full lg:w-1/4 bg-white px-4">
        {/* SEARCH-FILTER FROM HERO.JSX */}
        {isSearched &&
          (searchFilter.title !== "" || searchFilter.location !== "") && (
            <>
              <h3 className="font-medium text-lg mb-4">Current Search</h3>
              <div className="mb-4 text-gray-600">
                {searchFilter.title && (
                  <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
                    {searchFilter.title}{" "}
                    <img
                      onClick={() =>
                        setSearchFilter((prev) => ({ ...prev, title: "" }))
                      }
                      src={assets.cross_icon}
                      className="cursor-pointer"
                      alt="cross_icon"
                    />
                  </span>
                )}
                {searchFilter.location && (
                  <span className="ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded">
                    {searchFilter.location}{" "}
                    <img
                      onClick={() =>
                        setSearchFilter((prev) => ({ ...prev, location: "" }))
                      }
                      src={assets.cross_icon}
                      className="cursor-pointer"
                      alt="cross_icon"
                    />
                  </span>
                )}
              </div>
            </>
          )}
        <button
          onClick={(evt) => setShowFilter((prev) => !prev)}
          className="px-6 py-1.5 rounded border border-gray-100 lg:hidden">
          {showFilter ? "Close" : "Filters"}
        </button>
        {/* CATEGORY FILTER 💼*/}
        <div className={showFilter ? `` : `max-lg:hidden`}>
          <h4 className="font-medium text-lg py-4">Search By Categories</h4>
          <ul className="space-y-4 text-gray-600">
            {JobCategories.map((category, idx) => {
              return (
                <li className="flex gap-3 items-center" key={idx}>
                  <input
                    type="checkbox"
                    onChange={() => handleCategoryChange(category)}
                    className="scale-125"
                    checked={selectedCategories.includes(category)}
                  />
                  {category}
                </li>
              );
            })}
          </ul>
        </div>
        {/* LOCATION FILTER 📍*/}
        <div className={showFilter ? `` : `max-lg:hidden`}>
          <h4 className="pt-14 font-medium text-lg py-4">Search By Location</h4>
          <ul className="space-y-4 text-gray-600">
            {JobLocations.map((location, idx) => {
              return (
                <li className="flex gap-3 items-center" key={idx}>
                  <input
                    type="checkbox"
                    onChange={() => handleLocationChange(location)}
                    className="scale-125"
                    checked={selectedLocations.includes(location)}
                  />
                  {location}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {/* JOB LISTINGS 📃*/}
      <section className="w-full lg:w-3/4 text-gray-800 max-lg:px-4">
        <h3 className="font-medium text-3xl py-2" id="job-list">
          Latest Jobs
        </h3>
        <p className="mb-8">Get your desired job from top companies</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs
            .slice((currentPage - 1) * 6, currentPage * 6)
            .map((data, idx) => {
              return <JobCard key={idx} job={data} />;
            })}
        </div>
        {/* PAGINATION 🔢*/}
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-10">
            <a href="#job-list">
              <img
                onClick={() => setCurrentPage(Math.max(currentPage - 1), 1)}
                src={assets.left_arrow_icon}
                alt="left_arrow_icon"
              />
            </a>
            {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map(
              (_, idx) => (
                <a href="#job-list" key={idx}>
                  <button
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded ${
                      currentPage === idx + 1
                        ? `bg-blue-100 text-blue-500`
                        : `text-gray-500`
                    }`}>
                    {idx + 1}
                  </button>
                </a>
              )
            )}
            <a href="#job-list">
              <img
                src={assets.right_arrow_icon}
                alt="right_arrow_icon"
                onClick={() =>
                  setCurrentPage(
                    Math.min(currentPage + 1),
                    Math.ceil(jobs.length / 6)
                  )
                }
              />
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

export default JobListing;
