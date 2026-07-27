"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  GalleryItem,
  getGalleryItems,
} from "@/lib/galleryDb";
import OptimizedGalleryImage from "@/components/OptimizedGalleryImage";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeImageIndex, setActiveImageIndex] =
    useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const records = (
        await getGalleryItems({ publicDelivery: true })
      ).filter(
        (item) => item.status.toLocaleLowerCase() === "published"
      );

      setItems(records);

      setSelectedId((current) => {
        if (records.some((item) => item.id === current)) {
          return current;
        }

        return records[0]?.id ?? "";
      });
    } catch (loadError) {
      console.error("Unable to load public gallery:", loadError);
      setItems([]);
      setError("Gallery presentations are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();

    const refresh = () => void loadItems();

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

  const filters = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set([
          ...items.map((item) => item.division),
          ...items.map((item) => item.presentationType),
        ])
      ),
    ],
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedFilter = activeFilter.toLocaleLowerCase();

    if (normalizedFilter === "all") {
      return items;
    }

    return items.filter(
      (item) =>
        item.division.toLocaleLowerCase() === normalizedFilter ||
        item.presentationType.toLocaleLowerCase() === normalizedFilter
    );
  }, [items, activeFilter]);

  const selectedItem =
    filteredItems.find(
      (item) => item.id === selectedId
    ) ??
    filteredItems[0] ??
    null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedId, activeFilter]);

  const activeImage =
    selectedItem?.images[activeImageIndex] ??
    selectedItem?.images[0];

  function selectFilter(filter: string) {
    setActiveFilter(filter);

    const first =
      filter.toLocaleLowerCase() === "all"
        ? items[0]
        : items.find(
            (item) =>
              item.division.toLocaleLowerCase() ===
                filter.toLocaleLowerCase() ||
              item.presentationType.toLocaleLowerCase() ===
                filter.toLocaleLowerCase()
          );

    setSelectedId(first?.id ?? "");
  }

  return (
    <section className="presentationGalleryPage">
      <div className="presentationGalleryShell">
        <header className="presentationGalleryHeader">
          <div>
            <span>WORKIFY PRESENTATIONS</span>
            <h1>
              Construction and recruitment in action.
            </h1>
          </div>

          <p>
            View architectural renders, ongoing sites,
            completed projects, interview arrangements
            and recruitment-event presentations.
          </p>
        </header>

        <div className="presentationGalleryFilters">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={
                activeFilter === filter
                  ? "active"
                  : ""
              }
              onClick={() =>
                selectFilter(filter)
              }
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="presentationGalleryEmpty" aria-live="polite">
            <span>LOADING PRESENTATIONS</span>
            <h2>Preparing the latest Workify gallery.</h2>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="presentationGalleryEmpty">
            <span>
              {error ? "GALLERY UNAVAILABLE" : "NO PUBLISHED PRESENTATIONS"}
            </span>
            <h2>
              {error ||
                "The administrator has not published any photos in this category yet."}
            </h2>
          </div>
        ) : (
          <div className="presentationGalleryWorkspace">
            <div className="presentationGalleryList">
              {filteredItems.map((item, index) => {
                const cover =
                  item.images.find(
                    (image) =>
                      image.id === item.coverImageId
                  ) ?? item.images[0];

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      selectedItem?.id === item.id
                        ? "presentationGalleryCard active"
                        : "presentationGalleryCard"
                    }
                    onClick={() =>
                      setSelectedId(item.id)
                    }
                  >
                    <div className="presentationCardImage">
                      {cover && (
                        <OptimizedGalleryImage
                          src={cover.dataUrl}
                          alt={item.title}
                          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 42vw, 520px"
                        />
                      )}

                      <span>
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <div className="presentationCardText">
                      <small>
                        {item.division} Â·{" "}
                        {item.presentationType}
                      </small>

                      <h2>{item.title}</h2>
                      <p>{item.location}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedItem && (
              <aside className="presentationGalleryDetails">
                <div className="presentationDetailsHeader">
                  <div>
                    <span>
                      {selectedItem.division}
                    </span>

                    <h2>{selectedItem.title}</h2>
                  </div>

                  <b>
                    {selectedItem.presentationType}
                  </b>
                </div>

                <div className="presentationMainImage">
                  {activeImage && (
                    <OptimizedGalleryImage
                      src={activeImage.dataUrl}
                      alt={selectedItem.title}
                      sizes="(max-width: 760px) 100vw, (max-width: 1200px) 60vw, 1100px"
                      priority
                    />
                  )}

                  <div className="presentationImageCounter">
                    {String(
                      activeImageIndex + 1
                    ).padStart(2, "0")}
                    {" / "}
                    {String(
                      selectedItem.images.length
                    ).padStart(2, "0")}
                  </div>
                </div>

                {selectedItem.images.length > 1 && (
                  <div className="presentationThumbnails">
                    {selectedItem.images.map(
                      (image, index) => (
                        <button
                          type="button"
                          key={image.id}
                          className={
                            index === activeImageIndex
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            setActiveImageIndex(index)
                          }
                        >
                          <OptimizedGalleryImage
                            src={image.dataUrl}
                            alt={`${selectedItem.title} ${index + 1}`}
                            sizes="(max-width: 760px) 20vw, 150px"
                          />
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="presentationFacts">
                  <div>
                    <span>LOCATION</span>
                    <strong>
                      {selectedItem.location}
                    </strong>
                  </div>

                  <div>
                    <span>CLIENT SECTOR</span>
                    <strong>
                      {selectedItem.clientSector ||
                        "Not disclosed"}
                    </strong>
                  </div>

                  <div>
                    <span>DATE</span>
                    <strong>
                      {selectedItem.date ||
                        "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>PRESENTATION</span>
                    <strong>
                      {
                        selectedItem.presentationType
                      }
                    </strong>
                  </div>
                </div>

                <div className="presentationDescription">
                  <span>OVERVIEW</span>
                  <p>{selectedItem.description}</p>
                </div>

                {selectedItem.division ===
                  "Construction" && (
                  <div className="presentationMetrics">
                    <div>
                      <strong>
                        {selectedItem.progress}%
                      </strong>
                      <span>Project progress</span>
                    </div>

                    <div>
                      <strong>
                        {
                          selectedItem.workersDeployed
                        }
                      </strong>
                      <span>Workers deployed</span>
                    </div>
                  </div>
                )}

                {selectedItem.division ===
                  "Recruitment" && (
                  <>
                    {selectedItem.positionsRecruited && (
                      <div className="presentationDescription">
                        <span>
                          POSITIONS RECRUITED
                        </span>

                        <p>
                          {
                            selectedItem
                              .positionsRecruited
                          }
                        </p>
                      </div>
                    )}

                    <div className="presentationMetrics four">
                      <div>
                        <strong>
                          {
                            selectedItem
                              .applicationsReceived
                          }
                        </strong>
                        <span>
                          Applications received
                        </span>
                      </div>

                      <div>
                        <strong>
                          {
                            selectedItem
                              .candidatesScreened
                          }
                        </strong>
                        <span>
                          Candidates screened
                        </span>
                      </div>

                      <div>
                        <strong>
                          {
                            selectedItem
                              .candidatesInterviewed
                          }
                        </strong>
                        <span>
                          Candidates interviewed
                        </span>
                      </div>

                      <div>
                        <strong>
                          {
                            selectedItem
                              .vacanciesFilled
                          }
                        </strong>
                        <span>Vacancies filled</span>
                      </div>
                    </div>
                  </>
                )}
              </aside>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
