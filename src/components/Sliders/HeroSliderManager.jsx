import React, { useState, useEffect } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  Edit,
  Smartphone,
  Upload,
  Layers,
  RefreshCw,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

const HeroSliderManager = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    tag: "ZEROBRIKS",
    button_text: "Explore Now ↗",
    target_type: "signature_collection",
    target_url: "",
    order: 1,
    status: "Active",
    image: null,
    image_preview: "",
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  // Auto-play mobile preview
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setActivePreviewIndex((prev) => (prev + 1) % sliders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliders]);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || ""}/api/get_hero_sliders_admin`
      );
      const result = await response.json();
      if (result.status === 1 && Array.isArray(result.data)) {
        setSliders(result.data);
      } else {
        setSliders([]);
      }
    } catch (err) {
      console.error("Failed to load sliders from database API:", err);
      setSliders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSlider(null);
    setFormData({
      title: "",
      subtitle: "",
      tag: "ZEROBRIKS",
      button_text: "Explore Now ↗",
      target_type: "signature_collection",
      target_url: "",
      order: sliders.length + 1,
      status: "Active",
      image: null,
      image_preview: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || "",
      subtitle: slider.subtitle || "",
      tag: slider.tag || "ZEROBRIKS",
      button_text: slider.button_text || "Explore Now ↗",
      target_type: slider.target_type || "signature_collection",
      target_url: slider.target_url || "",
      order: slider.order || 1,
      status: slider.status || "Active",
      image: null,
      image_preview: slider.image || slider.image_url || "",
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          image_preview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleStatus = async (slider) => {
    const newStatus = slider.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || ""}/api/update_hero_slider`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slider_id: slider._id,
            status: newStatus,
          }),
        }
      );
      const result = await res.json();
      if (result.status === 1) {
        await fetchSliders();
      } else {
        Swal.fire("Error", result.msg || "Failed to update banner status", "error");
      }
    } catch (e) {
      console.error("Status toggle API error:", e);
      Swal.fire("Error", "Could not connect to server", "error");
    }
  };

  const handleDelete = async (sliderId) => {
    const confirm = await Swal.fire({
      title: "Delete Advertising Banner?",
      text: "This banner will be permanently removed from the database and mobile app.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#7A0E2E",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL || ""}/api/delete_hero_slider`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slider_id: sliderId }),
          }
        );
        const result = await res.json();
        if (result.status === 1) {
          await fetchSliders();
          Swal.fire("Deleted!", "Advertising banner deleted successfully.", "success");
        } else {
          Swal.fire("Error", result.msg || "Failed to delete banner", "error");
        }
      } catch (e) {
        console.error("Delete API error:", e);
        Swal.fire("Error", "Could not connect to server.", "error");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const dataPayload = new FormData();
    dataPayload.append("title", formData.title);
    dataPayload.append("subtitle", formData.subtitle);
    dataPayload.append("tag", formData.tag);
    dataPayload.append("button_text", formData.button_text);
    dataPayload.append("target_type", formData.target_type);
    dataPayload.append("target_url", formData.target_url);
    dataPayload.append("status", formData.status);
    dataPayload.append("order", formData.order);

    if (formData.image) {
      dataPayload.append("image", formData.image);
    } else if (formData.image_preview && !formData.image_preview.startsWith("data:")) {
      dataPayload.append("image_url", formData.image_preview);
    }

    if (editingSlider) {
      dataPayload.append("slider_id", editingSlider._id);
    }

    try {
      const endpoint = editingSlider
        ? `${process.env.REACT_APP_API_BASE_URL || ""}/api/update_hero_slider`
        : `${process.env.REACT_APP_API_BASE_URL || ""}/api/add_hero_slider`;

      const res = await fetch(endpoint, {
        method: "POST",
        body: dataPayload,
      });
      const result = await res.json();
      if (result.status === 1) {
        setIsModalOpen(false);
        await fetchSliders();
        Swal.fire({
          icon: "success",
          title: editingSlider ? "Banner Updated!" : "Banner Added!",
          text: "The advertising banner has been saved to the database.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", result.msg || "Failed to save banner", "error");
      }
    } catch (err) {
      console.error("Save API error:", err);
      Swal.fire("Error", "Could not connect to server.", "error");
    }
  };

  const currentPreview = sliders.length > 0 ? (sliders[activePreviewIndex] || sliders[0]) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ================================================================
          HERO PAGE HEADER
      ================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: "#7A0E2E" }}
          >
            <Sliders className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 tracking-tight m-0" style={{ fontSize: "16px", letterSpacing: "-0.2px" }}>
                Advertising & Hero Sliders
              </h2>
              <span className="px-2 py-0.5 rounded-full font-bold bg-[#D4AF37] text-[#52091D]" style={{ fontSize: "10.5px" }}>
                ADVERTISING
              </span>
            </div>
            <p className="text-gray-500 m-0 mt-0.5" style={{ fontSize: "12px" }}>
              Manage promotional and advertising banners loaded directly from the database and displayed in the Zerobriks mobile app & web hero section.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSliders}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors"
            style={{ fontSize: "12px" }}
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-xl font-bold text-white flex items-center gap-1.5 shadow-sm transition-all hover:brightness-110"
            style={{ backgroundColor: "#7A0E2E", fontSize: "12px" }}
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Advertising Banner</span>
          </button>
        </div>
      </div>

      {/* ================================================================
          LIVE MOBILE APP SIMULATOR / PREVIEW
      ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#7A0E2E]" />
              <h4 className="text-sm font-bold text-gray-900 m-0">
                Mobile App Live Hero Preview
              </h4>
            </div>
            {sliders.length > 0 && (
              <div className="flex items-center gap-1">
                {sliders.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePreviewIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      activePreviewIndex === i
                        ? "w-6 bg-[#7A0E2E]"
                        : "w-2 bg-gray-200 hover:bg-gray-300"
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Simulated Mobile Hero Aspect Ratio Card (430 / 230) */}
          {currentPreview ? (
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-amber-900/20 group aspect-[430/230] bg-[#52091D]">
              <img
                src={currentPreview.image}
                alt={currentPreview.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* =========================================================================
                  [HIDDEN AS OF NOW - DO NOT REMOVE, TO BE DEVELOPED IN FUTURE]
                  Overlay text (tag, subtitle, title) and button are hidden as requested.
                  ========================================================================= */}
              {/*
              <div className="absolute inset-0 bg-gradient-to-r from-[#52091D]/90 via-[#7A0E2E]/60 to-transparent p-5 sm:p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-amber-400"></div>
                    <span className="text-xs font-black tracking-widest text-white uppercase drop-shadow-sm font-sans">
                      {currentPreview.tag || "ZEROBRIKS"}
                    </span>
                  </div>

                  {currentPreview.subtitle && (
                    <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-amber-200/90 uppercase mb-2 border-b border-amber-400/40 pb-1 max-w-fit">
                      {currentPreview.subtitle}
                    </div>
                  )}

                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight max-w-sm leading-tight drop-shadow-md">
                    {currentPreview.title || "Untitled Banner"}
                  </h3>
                </div>

                <div>
                  <button className="px-3.5 py-1.5 rounded-lg bg-[#380413]/90 hover:bg-[#52091D] text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1.5 backdrop-blur-xs shadow-md transition-all">
                    <span>{currentPreview.button_text || "Explore Now ↗"}</span>
                  </button>
                </div>
              </div>
              */}

              {/* Slide Index Badge */}
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                Slide {activePreviewIndex + 1} of {sliders.length}
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50/80 aspect-[430/230] flex flex-col items-center justify-center p-6 text-center">
              <Smartphone className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-700 m-0">No Advertising Banners in Database</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm m-0">
                Upload your first banner using "+ Add Advertising Banner" to see the live mobile app carousel preview.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center m-0">
            Preview reflects the real-time layout in the Flutter mobile app home dashboard.
          </p>
        </div>

        {/* Quick Config Stats */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-gray-900 m-0">
              Slider Carousel Configuration
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 block text-[11px]">Total Banners</span>
                <span className="text-lg font-bold text-gray-900">{sliders.length}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 block text-[11px]">Active in App</span>
                <span className="text-lg font-bold text-emerald-600">
                  {sliders.filter((s) => s.status === "Active").length}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 block text-[11px]">Auto-Play Timer</span>
                <span className="text-sm font-bold text-gray-800">5 Seconds</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 block text-[11px]">Target Aspect</span>
                <span className="text-sm font-bold text-amber-700">430 × 230 px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          SLIDERS INVENTORY TABLE / LIST
      ================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#7A0E2E]" />
            <h3 className="font-bold text-gray-900 m-0" style={{ fontSize: "15px" }}>
              Active Sliders List ({sliders.length})
            </h3>
          </div>
          <span className="text-gray-500" style={{ fontSize: "12px" }}>
            Loaded dynamically from database
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle border-separate border-spacing-0 w-full mb-0">
            <thead>
              <tr style={{ backgroundColor: "#7A0E2E", color: "#FFFFFF" }}>
                <th className="py-3 px-3 text-xs uppercase text-white font-semibold text-center" style={{ backgroundColor: "#7A0E2E" }}>
                  Order
                </th>
                <th className="py-3 px-3 text-xs uppercase text-white font-semibold" style={{ backgroundColor: "#7A0E2E" }}>
                  Banner Image
                </th>
                <th className="py-3 px-3 text-xs uppercase text-white font-semibold" style={{ backgroundColor: "#7A0E2E" }}>
                  Title & Subtitle
                </th>
                <th className="py-3 px-3 text-xs uppercase text-white font-semibold" style={{ backgroundColor: "#7A0E2E" }}>
                  Target Action
                </th>
                <th className="py-3 px-3 text-xs uppercase text-white font-semibold" style={{ backgroundColor: "#7A0E2E" }}>
                  Status
                </th>
                <th className="py-3 px-3 text-xs uppercase text-white font-semibold text-center" style={{ backgroundColor: "#7A0E2E" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {sliders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 px-4">
                    <div className="flex flex-col items-center justify-center">
                      <Layers className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm font-bold text-gray-700 m-0">No Advertising Banners Found in Database</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-md m-0">
                        There are currently no advertising banners saved in the database. Click below to add your first banner.
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs transition-all hover:brightness-110"
                        style={{ backgroundColor: "#7A0E2E" }}
                      >
                        <Plus className="w-4 h-4 text-amber-300" />
                        <span>Add Advertising Banner</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sliders.map((slider, index) => {
                  const isActive = slider.status === "Active";
                  return (
                    <tr key={slider._id || index} className="hover:bg-amber-50/30 transition-colors">
                      {/* Order */}
                      <td className="text-center font-bold text-gray-700 py-3.5 px-3">
                        <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center mx-auto text-xs font-mono font-bold text-[#7A0E2E]">
                          {slider.order || index + 1}
                        </span>
                      </td>

                      {/* Image Thumbnail */}
                      <td className="py-3.5 px-3">
                        <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-xs bg-gray-100 flex-shrink-0">
                          {slider.image ? (
                            <img
                              src={slider.image}
                              alt={slider.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title & Details */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-sm text-gray-900 line-clamp-1">
                          {slider.title || "No Title"}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {slider.subtitle || "No Subtitle"}
                        </div>
                        {/* [HIDDEN AS OF NOW - COMMENTED CODE, TO BE DEVELOPED IN FUTURE]
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            {slider.tag || "ZEROBRIKS"}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Button: {slider.button_text || "Explore Now ↗"}
                          </span>
                        </div>
                        */}
                      </td>

                      {/* Target Action */}
                      <td className="py-3.5 px-3 text-xs">
                        <span className="font-semibold text-gray-800 capitalize">
                          {slider.target_type?.replace(/_/g, " ") || "Signature Collection"}
                        </span>
                        {slider.target_url && (
                          <div className="text-gray-400 text-[10px] truncate max-w-xs mt-0.5 font-mono">
                            {slider.target_url}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => handleToggleStatus(slider)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(slider)}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors shadow-2xs"
                            title="Edit Slider"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(slider._id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-colors shadow-2xs"
                            title="Delete Slider"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================
          ADD / EDIT SLIDER MODAL
      ================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#7A0E2E]/20 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#7A0E2E] via-[#52091D] to-[#7A0E2E] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold text-white m-0">
                  {editingSlider ? "Edit Advertising Banner" : "Add New Advertising Banner"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Image Upload & Live Preview */}
              <div>
                <label className="font-bold text-gray-800 block mb-1.5">
                  Hero Banner Image (Recommended: 1200 × 640 px or 430 × 230 px)
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-gray-300 p-4 hover:border-[#7A0E2E] transition-colors flex flex-col items-center justify-center bg-gray-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.image_preview ? (
                    <div className="w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={formData.image_preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700 m-0">
                        Click or drag image file here to upload
                      </p>
                      <span className="text-[11px] text-gray-400">JPG, PNG, WEBP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* =========================================================================
                  [HIDDEN AS OF NOW - DO NOT REMOVE, TO BE DEVELOPED IN FUTURE]
                  Tag, Subtitle and Button Text inputs are commented out as requested.
                  ========================================================================= */}
              {/*
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Brand Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="ZEROBRIKS"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Header Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Exceptional Spaces. Everyday Living."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                  />
                </div>
              </div>
              */}

              {/* Banner Title / Name (Internal Reference) */}
              <div>
                <label className="font-bold text-gray-800 block mb-1">
                  Banner Title / Reference Name *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Promotional Banner"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E] font-semibold"
                  required
                />
              </div>

              {/* Click Action / Target */}
              <div>
                {/*
                <div className="mb-2">
                  <label className="font-bold text-gray-800 block mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Explore Now ↗"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                  />
                </div>
                */}
                <label className="font-bold text-gray-800 block mb-1">Click Action / Target</label>
                <select
                  value={formData.target_type}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                >
                  <option value="signature_collection">The Signature Collection (Filter)</option>
                  <option value="buy">Buy Properties Feed</option>
                  <option value="rent">Rent Properties Feed</option>
                  <option value="commercial">Commercial Properties</option>
                  <option value="url">External Link URL</option>
                </select>
              </div>

              {/* Custom URL if applicable */}
              {formData.target_type === "url" && (
                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    Destination Web URL
                  </label>
                  <input
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    placeholder="https://zerobriks.com/signature-villas"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                  />
                </div>
              )}

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Display Sequence Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Slider Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-[#7A0E2E]"
                  >
                    <option value="Active">Active (Visible in App)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-white font-bold transition-all shadow-sm"
                  style={{ backgroundColor: "#7A0E2E" }}
                >
                  {editingSlider ? "Save Changes" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSliderManager;
