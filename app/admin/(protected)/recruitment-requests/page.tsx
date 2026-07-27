"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deleteRecruitmentRequest,
  getRecruitmentRequests,
  RecruitmentRequest,
  RecruitmentRequestStatus,
  updateRecruitmentRequestStatus,
} from "@/lib/recruitmentRequests";
import AdminSidebar from "@/components/AdminSidebar";

const statuses: RecruitmentRequestStatus[] = [
  "New",
  "Reviewing",
  "Proposal sent",
  "Active",
  "Completed",
  "Closed",
];

export default function AdminRecruitmentRequestsPage() {
  const [requests, setRequests] = useState<
    RecruitmentRequest[]
  >([]);

  const [query, setQuery] = useState("");

  const [selectedRequest, setSelectedRequest] =
    useState<RecruitmentRequest | null>(null);

  function loadRequests() {
    setRequests(getRecruitmentRequests());
  }

  useEffect(() => {
    loadRequests();

    function refresh() {
      loadRequests();
    }

    window.addEventListener(
      "workify-recruitment-requests-updated",
      refresh
    );

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        "workify-recruitment-requests-updated",
        refresh
      );

      window.removeEventListener(
        "storage",
        refresh
      );
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return requests;
    }

    return requests.filter((request) => {
      const searchableText = [
        request.organizationName,
        request.contactPerson,
        request.positions,
        request.sector,
        request.location,
        request.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery
      );
    });
  }, [query, requests]);

  function changeStatus(
    requestId: string,
    status: RecruitmentRequestStatus
  ) {
    updateRecruitmentRequestStatus(
      requestId,
      status
    );

    loadRequests();

    if (selectedRequest?.id === requestId) {
      setSelectedRequest({
        ...selectedRequest,
        status,
      });
    }
  }

  function removeRequest(requestId: string) {
    const confirmed = window.confirm(
      "Delete this recruitment request?"
    );

    if (!confirmed) {
      return;
    }

    deleteRecruitmentRequest(requestId);

    if (selectedRequest?.id === requestId) {
      setSelectedRequest(null);
    }

    loadRequests();
  }

  return (
    <section className="adminLight">
      <AdminSidebar />
      <main className="adminContent">
        <section className="adminRecruitmentPage">
      <div className="adminRecruitmentHeader">
        <div>
          <span>ADMINISTRATION</span>

          <h1>Recruitment Requests</h1>

          <p>
            Review recruitment assignments submitted
            by organizations and employers.
          </p>
        </div>

        <div className="adminRecruitmentCount">
          <strong>{requests.length}</strong>
          <span>Total requests</span>
        </div>
      </div>

      <div className="adminRecruitmentToolbar">
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search organization, position, sector or status"
          aria-label="Search recruitment requests"
        />

        <button
          type="button"
          onClick={loadRequests}
        >
          Refresh table
        </button>
      </div>

      <div className="adminRecruitmentWorkspace">
        <div className="adminRecruitmentTableWrap">
          <table className="adminRecruitmentTable">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Positions</th>
                <th>Vacancies</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="emptyRecruitmentTable"
                  >
                    No recruitment requests found.
                  </td>
                </tr>
              )}

              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong>
                      {request.organizationName}
                    </strong>

                    <small>
                      {request.sector}
                    </small>
                  </td>

                  <td>
                    {request.positions}
                  </td>

                  <td>
                    {request.vacancies}
                  </td>

                  <td>
                    {request.location}
                  </td>

                  <td>
                    {request.deadline}
                  </td>

                  <td>
                    <select
                      value={request.status}
                      onChange={(event) =>
                        changeStatus(
                          request.id,
                          event.target
                            .value as RecruitmentRequestStatus
                        )
                      }
                    >
                      {statuses.map((status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRequest(request)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="adminRecruitmentDetails">
          {!selectedRequest && (
            <div className="adminRecruitmentEmptyDetails">
              <span>REQUEST DETAILS</span>

              <h2>
                Select a request from the table.
              </h2>

              <p>
                The complete recruitment requirement
                will open here without leaving the
                admin page.
              </p>
            </div>
          )}

          {selectedRequest && (
            <>
              <div className="adminRecruitmentDetailsHead">
                <div>
                  <span>SELECTED REQUEST</span>

                  <h2>
                    {
                      selectedRequest.organizationName
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedRequest(null)
                  }
                >
                  Close
                </button>
              </div>

              <div className="adminRecruitmentDetailGrid">
                <div>
                  <span>Contact person</span>
                  <strong>
                    {selectedRequest.contactPerson}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    {selectedRequest.phone}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    {selectedRequest.email}
                  </strong>
                </div>

                <div>
                  <span>Sector</span>
                  <strong>
                    {selectedRequest.sector}
                  </strong>
                </div>

                <div>
                  <span>Employment type</span>
                  <strong>
                    {
                      selectedRequest.employmentType
                    }
                  </strong>
                </div>

                <div>
                  <span>Vacancies</span>
                  <strong>
                    {selectedRequest.vacancies}
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    {selectedRequest.location}
                  </strong>
                </div>

                <div>
                  <span>Deadline</span>
                  <strong>
                    {selectedRequest.deadline}
                  </strong>
                </div>
              </div>

              <div className="adminRecruitmentDetailSection">
                <span>Positions</span>
                <p>
                  {selectedRequest.positions}
                </p>
              </div>

              <div className="adminRecruitmentDetailSection">
                <span>Requested services</span>

                <div className="adminRecruitmentServiceTags">
                  {selectedRequest.services.map(
                    (service) => (
                      <b key={service}>
                        {service}
                      </b>
                    )
                  )}
                </div>
              </div>

              <div className="adminRecruitmentDetailSection">
                <span>
                  Qualifications and experience
                </span>

                <p>
                  {
                    selectedRequest.qualifications
                  }
                </p>
              </div>

              <div className="adminRecruitmentDetailSection">
                <span>
                  Additional instructions
                </span>

                <p>
                  {selectedRequest.instructions ||
                    "No additional instructions."}
                </p>
              </div>

              <button
                className="adminDeleteRecruitment"
                type="button"
                onClick={() =>
                  removeRequest(
                    selectedRequest.id
                  )
                }
              >
                Delete request
              </button>
            </>
          )}
        </aside>
      </div>
        </section>
      </main>
    </section>
  );
}
