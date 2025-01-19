```jsx
// f(x) to update job applications status
  async function changeJobApplicationStatus(id, status) {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/company/change-status",
        { id, status },
        {
          headers: { token: companyToken },
        }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobApplications();
      } else {
        toast.error(data.message || "Failed to update application status.");
        console.log(error);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update application status.");
      console.log(error);
    }
  }
```