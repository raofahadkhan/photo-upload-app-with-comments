'use client';

import { useState, ChangeEvent, useEffect } from "react";
// import Image from 'next/image'; // Uncomment if you choose to use Next.js Image component

interface Image {
  id: number;
  url: string;
  createdAt: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
}

export default function ImageUploadAndComments() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [images, setImages] = useState<Image[]>([]);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string>("");

  // Fetch all images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/images");
      const data = await res.json();

      if (res.ok) {
        setImages(data);
      } else {
        console.error(data.error || "Failed to fetch images.");
        setError(data.error || "Failed to fetch images.");
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("An error occurred while fetching images.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    try {
      // Add detailed logging for debugging
      console.log("Uploading image with preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      // Upload image directly to Cloudinary
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      console.log("Cloudinary response status:", res.status);
      console.log("Cloudinary response data:", data);

      if (res.ok) {
        // Save image URL to the database
        const saveRes = await fetch("/api/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: data.secure_url }),
        });

        const savedImage = await saveRes.json();

        console.log("Save Image API response status:", saveRes.status);
        console.log("Saved Image Data:", savedImage);

        if (saveRes.ok) {
          // Update images state with the new image
          setImages([savedImage, ...images]);
          setSelectedFile(null);
          setPreviewUrl("");
        } else {
          setError(savedImage.error || "Failed to save image.");
        }
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError("An error occurred while uploading the image.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async (imageId: number) => {
    const commentContent = newComment[imageId]?.trim();
    if (!commentContent) return;

    try {
      // Add detailed logging for debugging
      console.log(`Adding comment to image ID ${imageId}:`, commentContent);

      const res = await fetch(`/api/comments/${imageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent }),
      });

      const comment = await res.json();

      console.log("Add Comment API response status:", res.status);
      console.log("Add Comment Response:", comment);

      if (res.ok) {
        console.log("Comment added:", comment);

        // Update comments for the specific image
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === imageId
              ? { ...img, comments: [comment, ...(img.comments || [])] } // Safe spreading
              : img
          )
        );

        // Clear the comment input
        setNewComment((prev) => ({ ...prev, [imageId]: "" }));
      } else {
        console.error("Error adding comment:", comment.error);
        setError(comment.error || "Failed to add comment.");
      }
    } catch (err: any) {
      console.error("Error adding comment:", err);
      setError("An error occurred while adding the comment.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-semibold mb-6">Upload an Image</h2>
      <div className="flex items-center flex-col md:flex-row">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 md:mb-0 md:mr-4"
        />
        {previewUrl && (
          // <img
          //   src={previewUrl}
          //   alt="Preview"
          //   className="w-32 h-32 object-cover rounded"
          // />
          <div className="w-32 h-32 relative mb-4 md:mb-0">
            {/* Uncomment the below lines if you choose to use Next.js Image component */}
            {/* <Image
              src={previewUrl}
              alt="Preview"
              layout="fill"
              objectFit="cover"
              className="rounded"
            /> */}
            {/* Temporary fallback using img tag */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      <hr className="my-8" />

      <h2 className="text-2xl font-semibold mb-6">Uploaded Images</h2>
      {images.length === 0 ? (
        <p className="text-gray-500">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image) => (
            <div key={image.id} className="border rounded p-4">
              {/* <img
                src={image.url}
                alt={`Image ${image.id}`}
                className="w-full h-auto rounded"
              /> */}
              <div className="w-full h-48 relative">
                {/* Uncomment the below lines if you choose to use Next.js Image component */}
                {/* <Image
                  src={image.url}
                  alt={`Image ${image.id}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                /> */}
                {/* Temporary fallback using img tag */}
                <img
                  src={image.url}
                  alt={`Image ${image.id}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Comments</h3>
                <div className="flex mt-2">
                  <input
                    type="text"
                    value={newComment[image.id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [image.id]: e.target.value,
                      }))
                    }
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border rounded-l text-black"
                  />
                  <button
                    onClick={() => handleAddComment(image.id)}
                    disabled={!newComment[image.id]?.trim() || uploading}
                    className="px-4 py-2 bg-green-500 text-white rounded-r disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
                {image?.comments?.length === 0 ? (
                  <p className="text-gray-500 mt-2">No comments yet.</p>
                ) : (
                  <ul className="mt-4">
                    {image?.comments?.map((comment) => (
                      <li key={comment.id} className="mb-2 p-2 border rounded">
                        <p>{comment.content}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
