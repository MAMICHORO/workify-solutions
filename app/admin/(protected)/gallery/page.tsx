"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createId,
  deleteGalleryItem,
  fileToGalleryImage,
  GalleryDivision,
  GalleryImage,
  GalleryItem,
  GalleryPresentationType,
  getGalleryItems,
  saveGalleryItem,
} from "@/lib/galleryDb";
import AdminSidebar from "@/components/AdminSidebar";

const constructionTypes: GalleryPresentationType[] = [
  "Concept Render",
  "Ongoing Construction",
  "Completed Project",
];

const recruitmentTypes: GalleryPresentationType[] = [
  "Interview Setup",
  "Recruitment Event",
  "Training and Orientation",
  "Recruitment Assignment",
];

const emptyForm = {
  title: "",
  division: "Construction" as GalleryDivision,
  presentationType: "Concept Render" as GalleryPresentationType,
  location: "",
  clientSector: "",
  description: "",
  date: "",
  status: "Draft" as "Draft" | "Published",
  featured: false,
  progress: 0,
  workersDeployed: 0,
  applicationsReceived: 0,
  candidatesScreened: 0,
  candidatesInterviewed: 0,
  vacanciesFilled: 0,
  positionsRecruited: "",
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    const records = await getGalleryItems();
    setItems(records);

    setSelectedId((current) => {
      if (records.some((item) => item.id === current)) {
        return current;
      }

      return records[0]?.id ?? "";
    });
  }

  useEffect(() => {
    loadItems();

    const refresh = () => loadItems();

    window.addEventListener(
      "workify-gallery-updated",
      refresh
    );

    return () => {
      window.removeEventListener(
        "workify-gallery-updated",
        refresh
      );
    };
  }, []);

  const selectedItem =
    items.find((item) => item.id === selectedId) ?? null;

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      [
        item.title,
        item.division,
        item.presentationType,
        item.location,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [items, query]);

  const presentationTypes =
    form.division === "Construction"
      ? constructionTypes
      : recruitmentTypes;

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
    setImages([]);
    setCoverImageId("");
    setMessage("");
  }

  function startNewItem() {
    resetForm();
    setShowForm(true);
  }

  function editItem(item: GalleryItem) {
    setEditingId(item.id);

    setForm({
      title: item.title,
      division: item.division,
      presentationType: item.presentationType,
      location: item.location,
      clientSector: item.clientSector,
      description: item.description,
      date: item.date,
      status: item.status,
      featured: item.featured,
      progress: item.progress,
      workersDeployed: item.workersDeployed,
      applicationsReceived: item.applicationsReceived,
      candidatesScreened: item.candidatesScreened,
      candidatesInterviewed: item.candidatesInterviewed,
      vacanciesFilled: item.vacanciesFilled,
      positionsRecruited: item.positionsRecruited,
    });

    setImages(item.images);
    setCoverImageId(item.coverImageId);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function addImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    try {
      const converted = await Promise.all(
        files.map(fileToGalleryImage)
      );

      setImages((current) => {
        const updated = [...current, ...converted];

        if (!coverImageId && updated[0]) {
          setCoverImageId(updated[0].id);
        }

        return updated;
      });

      event.target.value = "";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add images."
      );
    }
  }

  function removeImage(imageId: string) {
    setImages((current) =>
      current.filter((image) => image.id !== imageId)
    );

    if (coverImageId === imageId) {
      const nextCover = images.find(
        (image) => image.id !== imageId
      );

      setCoverImageId(nextCover?.id ?? "");
    }
  }

  function moveImage(
    index: number,
    direction: -1 | 1
  ) {
    const destination = index + direction;

    if (
      destination < 0 ||
      destination >= images.length
    ) {
      return;
    }

    setImages((current) => {
      const copy = [...current];

      [copy[index], copy[destination]] = [
        copy[destination],
        copy[index],
      ];

      return copy;
    });
  }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (images.length === 0) {
      setMessage(
        "Add at least one construction or recruitment presentation photo."
      );
      return;
    }

    if (!coverImageId) {
      setMessage("Select a cover photo.");
      return;
    }

    setSaving(true);

    const now = new Date().toISOString();

    const existing = items.find(
      (item) => item.id === editingId
    );

    const record: GalleryItem = {
      id: editingId || createId(),
      ...form,
      images,
      coverImageId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await saveGalleryItem(record);
    await loadItems();

    setSelectedId(record.id);
    setShowForm(false);
    resetForm();
    setSaving(false);
  }

  async function removeItem(id: string) {
    const confirmed = window.confirm(
      "Delete this gallery presentation permanently?"
    );

    if (!confirmed) {
      return;
    }

    await deleteGalleryItem(id);
    await loadItems();
  }

  async function togglePublication(
    item: GalleryItem
  ) {
    await saveGalleryItem({
      ...item,
      status:
        item.status === "Published"
          ? "Draft"
          : "Published",
      updatedAt: new Date().toISOString(),
    });

    await loadItems();
  }

  return (
    <section className="adminLight">
      <AdminSidebar />
      <main className="adminContent">
        <section className="galleryAdminPage">
      <header className="galleryAdminHeader">
        <div>
          <span>ADMINISTRATION</span>
          <h1>Presentation Gallery</h1>
          <p>
            Upload construction renders, ongoing sites,
            completed projects and recruitment-site
            arrangements.
          </p>
        </div>

        <button
          type="button"
          onClick={
            showForm
              ? () => {
                  setShowForm(false);
                  resetForm();
                }
              : startNewItem
          }
        >
          {showForm
            ? "Close editor"
            : "+ Add presentation"}
        </button>
      </header>

      {showForm && (
        <form
          className="galleryAdminForm"
          onSubmit={submit}
        >
          <div className="galleryFormHeading">
            <div>
              <span>
                {editingId
                  ? "EDIT PRESENTATION"
                  : "NEW PRESENTATION"}
              </span>

              <h2>
                Add visual evidence for the public
                website.
              </h2>
            </div>

            <strong>
              {images.length} photo
              {images.length === 1 ? "" : "s"}
            </strong>
          </div>

          {message && (
            <div className="galleryFormMessage">
              {message}
            </div>
          )}

          <div className="galleryAdminFormGrid">
            <label>
              Presentation title
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="Enter the presentation title"
              />
            </label>

            <label>
              Division
              <select
                value={form.division}
                onChange={(event) => {
                  const division =
                    event.target.value as GalleryDivision;

                  setForm({
                    ...form,
                    division,
                    presentationType:
                      division === "Construction"
                        ? "Concept Render"
                        : "Interview Setup",
                  });
                }}
              >
                <option>Construction</option>
                <option>Recruitment</option>
              </select>
            </label>

            <label>
              Presentation type
              <select
                value={form.presentationType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    presentationType:
                      event.target
                        .value as GalleryPresentationType,
                  })
                }
              >
                {presentationTypes.map((type) => (
                  <option key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Publication status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target
                      .value as "Draft" | "Published",
                  })
                }
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </label>

            <label>
              Location
              <input
                required
                value={form.location}
                onChange={(event) =>
                  setForm({
                    ...form,
                    location: event.target.value,
                  })
                }
                placeholder="Town, county or region"
              />
            </label>

            <label>
              Client sector
              <input
                value={form.clientSector}
                onChange={(event) =>
                  setForm({
                    ...form,
                    clientSector:
                      event.target.value,
                  })
                }
                placeholder="Private client, NGO, government..."
              />
            </label>

            <label>
              Presentation date
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value,
                  })
                }
              />
            </label>

            <label className="galleryFeaturedField">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  setForm({
                    ...form,
                    featured: event.target.checked,
                  })
                }
              />

              <span>
                Feature this presentation
              </span>
            </label>

            {form.division === "Construction" && (
              <>
                <label>
                  Project progress
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.progress}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        progress: Number(
                          event.target.value
                        ),
                      })
                    }
                  />
                </label>

                <label>
                  Workers deployed
                  <input
                    type="number"
                    min="0"
                    value={form.workersDeployed}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        workersDeployed: Number(
                          event.target.value
                        ),
                      })
                    }
                  />
                </label>
              </>
            )}

            {form.division === "Recruitment" && (
              <>
                <label className="galleryWideField">
                  Positions recruited
                  <input
                    value={form.positionsRecruited}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        positionsRecruited:
                          event.target.value,
                      })
                    }
                    placeholder="Field Officers, Accountants, Drivers..."
                  />
                </label>

                <label>
                  Applications received
                  <input
                    type="number"
                    min="0"
                    value={form.applicationsReceived}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        applicationsReceived:
                          Number(event.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Candidates screened
                  <input
                    type="number"
                    min="0"
                    value={form.candidatesScreened}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        candidatesScreened:
                          Number(event.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Candidates interviewed
                  <input
                    type="number"
                    min="0"
                    value={
                      form.candidatesInterviewed
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        candidatesInterviewed:
                          Number(event.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  Vacancies filled
                  <input
                    type="number"
                    min="0"
                    value={form.vacanciesFilled}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        vacanciesFilled:
                          Number(event.target.value),
                      })
                    }
                  />
                </label>
              </>
            )}

            <label className="galleryWideField">
              Description
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Explain what the photographs show, the stage reached and the outcome."
              />
            </label>
          </div>

          <div className="galleryUploadSection">
            <div className="galleryUploadHeading">
              <div>
                <span>PRESENTATION PHOTOS</span>
                <h3>
                  Upload one cover photo and additional
                  gallery photos.
                </h3>
              </div>

              <label className="galleryUploadButton">
                Choose photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={addImages}
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="galleryUploadEmpty">
                <strong>No photos selected</strong>
                <p>
                  Add construction renders, site
                  progress, completed work, interview
                  venue setup or recruitment-event
                  arrangements.
                </p>
              </div>
            ) : (
              <div className="galleryImageEditor">
                {images.map((image, index) => (
                  <article
                    key={image.id}
                    className={
                      coverImageId === image.id
                        ? "galleryImageCard cover"
                        : "galleryImageCard"
                    }
                  >
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                    />

                    <div className="galleryImageMeta">
                      <span>
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <strong>
                        {coverImageId === image.id
                          ? "COVER PHOTO"
                          : image.name}
                      </strong>
                    </div>

                    <div className="galleryImageControls">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          moveImage(index, -1)
                        }
                      >
                        â†
                      </button>

                      <button
                        type="button"
                        disabled={
                          index === images.length - 1
                        }
                        onClick={() =>
                          moveImage(index, 1)
                        }
                      >
                        â†’
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCoverImageId(image.id)
                        }
                      >
                        Set cover
                      </button>

                      <button
                        type="button"
                        className="removePhoto"
                        onClick={() =>
                          removeImage(image.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <button
            className="gallerySaveButton"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving presentation..."
              : editingId
                ? "Update presentation"
                : "Save presentation"}
          </button>
        </form>
      )}

      <div className="galleryAdminToolbar">
        <input
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search presentations"
          aria-label="Search gallery presentations"
        />

        <strong>
          {items.length} presentation
          {items.length === 1 ? "" : "s"}
        </strong>
      </div>

      <div className="galleryAdminWorkspace">
        <div className="galleryAdminTableWrap">
          <table className="galleryAdminTable">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Division</th>
                <th>Type</th>
                <th>Status</th>
                <th>Photos</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="galleryEmptyRow"
                  >
                    No presentations found.
                  </td>
                </tr>
              )}

              {filteredItems.map((item) => {
                const cover =
                  item.images.find(
                    (image) =>
                      image.id === item.coverImageId
                  ) ?? item.images[0];

                return (
                  <tr key={item.id}>
                    <td>
                      {cover && (
                        <img
                          className="galleryAdminThumbnail"
                          src={cover.dataUrl}
                          alt={item.title}
                        />
                      )}
                    </td>

                    <td>
                      <strong>{item.title}</strong>
                      <small>{item.location}</small>
                    </td>

                    <td>{item.division}</td>
                    <td>{item.presentationType}</td>
                    <td>
                      <button
                        type="button"
                        className={
                          item.status === "Published"
                            ? "publicationBadge published"
                            : "publicationBadge"
                        }
                        onClick={() =>
                          togglePublication(item)
                        }
                      >
                        {item.status}
                      </button>
                    </td>

                    <td>{item.images.length}</td>

                    <td>
                      <div className="galleryTableActions">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedId(item.id)
                          }
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            editItem(item)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="galleryAdminDetails">
          {!selectedItem ? (
            <div className="galleryAdminDetailsEmpty">
              <span>PRESENTATION DETAILS</span>
              <h2>Select a gallery record.</h2>
              <p>
                The photos and presentation statistics
                will open here.
              </p>
            </div>
          ) : (
            <>
              <span className="galleryDetailsLabel">
                SELECTED PRESENTATION
              </span>

              <h2>{selectedItem.title}</h2>

              <div className="galleryAdminPreviewGrid">
                {selectedItem.images
                  .slice(0, 4)
                  .map((image) => (
                    <img
                      key={image.id}
                      src={image.dataUrl}
                      alt={selectedItem.title}
                    />
                  ))}
              </div>

              <div className="galleryAdminFacts">
                <div>
                  <span>DIVISION</span>
                  <strong>
                    {selectedItem.division}
                  </strong>
                </div>

                <div>
                  <span>TYPE</span>
                  <strong>
                    {
                      selectedItem.presentationType
                    }
                  </strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>
                    {selectedItem.location}
                  </strong>
                </div>

                <div>
                  <span>STATUS</span>
                  <strong>
                    {selectedItem.status}
                  </strong>
                </div>
              </div>

              <p>{selectedItem.description}</p>

              <button
                type="button"
                onClick={() =>
                  editItem(selectedItem)
                }
              >
                Edit presentation
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
