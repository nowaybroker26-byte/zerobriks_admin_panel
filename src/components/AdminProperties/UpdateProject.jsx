import { EP } from '../../Api/endpoints';
import React, { useState, useEffect, useRef } from "react";
import { IoIosInformationCircle } from "react-icons/io";
import { Plus } from "lucide-react"; // Using Lucide Icons for delete button
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import axios from "axios";
import { Trash } from "@phosphor-icons/react";
import { useNavigate,Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    GoogleMap,
    LoadScript,
    Marker,
    Autocomplete,
} from "@react-google-maps/api";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaFilePdf } from "react-icons/fa";
import { Country, State } from "country-state-city";
import { MdErrorOutline } from "react-icons/md";
import Select from "react-select";
import { FaRupeeSign } from "react-icons/fa";

const UpdateProject = () => {
    // Define state for the form fields
    const [projectName, setProjectName] = useState("");
    const { id } = useParams();
    const [isFeatured, setIsFeatured] = useState(false);
    const userId = sessionStorage.getItem("accessToken");
    const user_type = sessionStorage.getItem("user_type");
    const user_name = sessionStorage.getItem("user_name");
    const Mobile_Number = sessionStorage.getItem("Mobile_Number");
    const user_email = sessionStorage.getItem("user_email");
    const [propertyType, setPropertyType] = useState("");
    const [allCountries, setAllCountries] = useState([]);
    const [allStates, setAllStates] = useState([]);
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const autoCompleteRef = useRef(null);
    const GOOGLE_MAPS_API_KEY = "AIzaSyCY4i1-nQFNVTSYetMw7aofzBRwGvCH_Ms";
    const [totalProjectSize, setTotalProjectSize] = useState("");
    const [averagePrice, setAveragePrice] = useState("");
    const [configurations, setConfigurations] = useState("");
    const [launchDate, setLaunchDate] = useState("");
    const [possessionStart, setPossessionStart] = useState("");
    const [constructionStatus, setConstructionStatus] = useState("");
    const [reraId, setReraId] = useState("");
    const [floorLivingDining, setFloorLivingDining] = useState("");
    const [floorKitchenToilet, setFloorKitchenToilet] = useState("");
    const [floorBedroom, setFloorBedroom] = useState("");
    const [floorBalcony, setFloorBalcony] = useState("");
    const [wallsLivingDining, setWallsLivingDining] = useState("");
    const [wallServantRoom, setWallCeilingsServantRoom] = useState("");
    const [wallsKitchenToilet, setWallsKitchenToilet] = useState("");
    const [wallsServantRoom, setWallsServantRoom] = useState("");
    const [ceiling, setCeiling] = useState("");
    const [ceilingsServantRoom, setCeilingsServantRoom] = useState("");
    const [countersKitchenToilet, setCountersKitchenToilet] = useState("");
    const [fittingsKitchenToilet, setFittingsKitchenToilet] = useState("");
    const [fittingsServantRoomToilet, setFittingsServantRoomToilet] = useState("");
    const [internalDoor, setInternalDoor] = useState("");
    const [externalGlazing, setExternalGlazing] = useState("");
    const [electrical, setElectrical] = useState("");
    const [backup, setBackup] = useState("");
    const [securitySystem, setSecuritySystem] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [video, setVideo] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const videoInputRef = useRef(null);
    const [videoSource, setVideoSource] = useState("");
    const [videoURL, setVideoURL] = useState("");
    const navigate = useNavigate();
    const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 });
    const [amenitiesList, setAmenitiesList] = useState([]);
    const calendarRef = useRef(null);
    const possessionStartRef = useRef(null);
    const [logo, setLogo] = useState(null);
    const logoInputRef = useRef(null);
    const [brochureDoc, setBrochureDoc] = useState(null);
    const [brochureDocFromAPI, setBrochureDocFromAPI] = useState(null);
    const brochureInputRef = useRef();
    // Inside your component
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [errors, setErrors] = useState({});
    const [officeSubType, setOfficeSubType] = useState("");
    const [retailWashroom, setRetailWashroom] = useState("");
    const [retailLocation, setRetailLocation] = useState("");
    const [RetailSubType, setRetailSubType] = useState("");
    const [storageType, setStorageType] = useState("");
    const [industryType, setIndustryType] = useState("");
    const [landType, setLandType] = useState("");
    const [hospitalityType, setHospitalityType] = useState("");
    const [addressArea, setAddressArea] = useState("");
    

     const buildingTypes = ["Residential", "Commercial"];
     const residentialTypes = [
    "Apartment",
    // "Plot",
    "Independent House/Villa",
    "Independent/Builder Floor",
    "1RK/Studio Apartment",
    "Service Apartment",
    "Farmhouse",
    "Other",
  ];
     const commercialTypes = [
    "Office",
    "Retail",
    "Plot/Land",
    // "Office Space in IT/SEZ",
    "Storage",
    // "Warehouse",
    "Industry",
    "Hospitality",
    "Other",
  ];
     const options = [
    { value: "Pooja Room", label: "Pooja Room" },
    { value: "Study Room", label: "Study Room" },
    { value: "Servant Room", label: "Servant Room" },
    { value: "Store Room", label: "Store Room" },
  ];
   const officeOptions = [
    "Ready to move office space",
    "Bare shell office space",
    "Co-working office space",
  ];

  const landOptions = [
    "Commercial Land/Inst. Land",
    "Industrial Lands/Plots",
    "Agricultural/Farm Land",
  ];

  const retailOptions = ["Commercial Shops", "Commercial Showrooms"];

  const storageOptions = ["Ware House", "Cold Storage"];

  const industryOptions = ["Factory", "Manufacturing"];

  const hospitalityOptions = ["Hotel/Resorts", "Guest-House/Banquet-Halls"];
  const retailLocationOptions = [
    "Mall",
    "Commercial Project",
    "Residential Project",
    "Retail Complex/Building",
    "Market/High Street",
    "Others",
  ];
  const builderFloorOptions = ["Single Floor", "Duplex", "Triplex"];
  const constructionOptions = ["Shed", "Rooms", "Washroom", "Others"];
     const [buildingType, setBuildingType] = useState("Residential");


      const CustomMultiValue = (props) => {
    return (
      <div className="flex items-center bg-purple-100 text-purple-700 px-2 py-1 rounded">
        {props.children}
      </div>
    );
  };

  const buildPrompt = () => {
    return `
Write a professional real estate project description.

STRICT INSTRUCTIONS:
- The description MUST be between 600 and 700 characters ONLY
- Do NOT exceed 700 characters
- Do NOT go below 600 characters
- Write everything in ONE paragraph
- Do NOT use bullet points or line breaks

Project Details:
- Project Name: ${projectName?.trim() || ""}
- Type: ${propertyType || ""}
- Building Type: ${buildingType || ""}
- City: ${city?.trim() || ""}
- Area: ${addressArea || ""}
- Average Price: ₹${formData?.average_project_price || ""}
- Configurations: ${configurations || ""}
- Construction Status: ${constructionStatus || ""}
- Total Project Size: ${totalProjectSize || ""}
- Launch Date: ${launchDate || ""}
- Possession Start: ${possessionStart || ""}

Make it engaging, attractive, and human-like.
`;
  };
const generateDescription = async () => {
  try {
    setIsGeneratingDescription(true);

    const response = await axios.post(
      `${EP.CUST_API_GENERATE_PROPERTY_DESCRIPTION}`,
      {
        form_type: "project",
        prompt: buildPrompt(),
      }
    );

    const generatedDescription = response?.data?.description || "";

    if (response?.data?.status !== 1 || !generatedDescription) {
      toast.error(
        response?.data?.message || "Failed to generate description"
      );
      return;
    }

    setDescription(generatedDescription);

    setFormData((prev) => ({
      ...prev,
      project_description: generatedDescription,
    }));

    toast.success("Description generated successfully");
  } catch (error) {
    console.log("Generate Description Error:", error);
    toast.error("Failed to generate description");
  } finally {
    setIsGeneratingDescription(false);
  }
};
    const handleLogoFile = (file) => {
        const maxSizeInBytes = 5 * 1024 * 1024;
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp", "image/bmp"];
        if (!validTypes.includes(file.type)) {
            alert("Invalid image type. Please upload a JPG, PNG, GIF, or BMP image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image is too large. Max size is 5MB.");
            return;
        }
        setLogo(file);
    };

    const handleLogoDelete = () => {
        setLogo(null);
    };

     const handleBrochureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      alert("File size exceeds 50MB limit");
      return;
    }

    setBrochureDoc(file);
  };

    const handleBrochureDelete = () => {
        setBrochureDoc(null);
        setBrochureDocFromAPI(null);
    };

    const handlePossessionStartChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            possession_start: value,
        }));
    };
    const openPossessionStartCalendar = () => {
        if (possessionStartRef.current) {
            possessionStartRef.current.showPicker();
        }
    };

    const handleDateChange = (e) => {
        const value = e.target.value;
        setFormData((prev) => ({
            ...prev,
            launch_date: value,
        }));
    };

    const openCalendar = () => {
        if (calendarRef.current) {
            calendarRef.current.showPicker();
        }
    };

    const steps = [
        "Basic Info",
        "Address",
        "Project Details",
        "Amenities",
        "Photos / Videos",
    ];
    const [activeStep, setActiveStep] = useState(0);

    const nextStep = () =>
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

    const propertyTypes = [
        "Apartment",
        "Plot",
        "Villa",
        "Builder Floor",
        "Penthouse",
        "Independent House",
    ];

    const [selectedAmenities, setSelectedAmenities] = useState([]);

    const toggleAmenity = (id) => {
        setSelectedAmenities((prev) => {
            const updated = prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id];

            console.log("Updated Selected Amenities:", updated); // Log the updated state
            setIsModified(true); // Mark form as modified
            return updated;
        });
    };

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await axios.post(
                    `${EP.CUST_API_GET_AMENITIES}`
                );
                if (response.data.status === 1) {
                    setAmenitiesList(response.data.data);
                } else {
                    console.error("Failed to fetch amenities");
                }
            } catch (error) {
                console.error("Error fetching amenities:", error);
            }
        };

        fetchAmenities();
    }, []);

    const [formData, setFormData] = useState({
        step1: {},
        step2: {},
        step3: {},
        step4: {},
        // Add based on how many steps you have
    });

    const handleNext = () => {
        // Example: Saving currentStepData into corresponding step
        const updatedData = { ...formData };
        updatedData[`step${activeStep + 1}`] = currentStepData;
        setFormData(updatedData);

        // Move to next step
        nextStep();
    };

    const [currentStepData, setCurrentStepData] = useState({});

    const [fileData, setFileData] = useState([]);

    const handleDelete = async (index) => {
        const imageToDelete = imagesFromAPI[index];
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'This image will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!confirm.isConfirmed) return;

        if (imageToDelete?._id) {
            try {
                const form = new FormData();
                form.append("project_image_id", imageToDelete._id);

                const res = await fetch(`${EP.CUST_API_REMOVE_PROJECT_IMAGE}`, {
                    method: "DELETE",
                    body: form,
                });

                const data = await res.json();

                if (res.ok && data.status === 1) {
                    // Update UI only if deletion was successful
                    setImagesFromAPI((prev) => prev.filter((_, i) => i !== index));
                    setIsModified(true);
                    toast.success("Image deleted successfully");
                } else {
                    toast.error("Failed to delete image");
                    console.error("Delete error:", data);
                }
            } catch (error) {
                toast.error("Error deleting image");
                console.error("API error:", error);
            }
        }
    };

    const imageInputRef = useRef(null);

    const [images, setImages] = useState([]);

    const imageInputRef2 = useRef(null);

    const handleImageUpload2 = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10MB
        const maxImages = 5;

        let oversizeFound = false;
        let oversizedFiles = [];
        let newImages = [];
        let newFiles = [];

        for (let file of files) {
            if (file.size > maxSize) {
                oversizeFound = true;
                oversizedFiles.push(file.name);
            } else {
                newImages.push(URL.createObjectURL(file));
                newFiles.push(file);
            }
        }

        if (oversizeFound) {
            toast.error(
                `The following images are larger than 10MB: ${oversizedFiles.join(", ")}`
            );
        }

        if (newImages.length > maxImages) {
            toast.error("You can only upload a maximum of 5 images.");
            return;
        }

        // Clear previous images and set new ones
        setImages([]);
        setImagesFromAPI([])
        setImages([...newImages]);
        setFileData([...newFiles]);
        setIsModified(true);
        e.target.value = "";
    };


    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        const maxSize = 50 * 1024 * 1024;

        if (file && file.size > maxSize) {
            toast.error("Video size must be less than 50MB");
            return;
        }

        const objectURL = URL.createObjectURL(file);
        setVideo(null);
        setVideoFromAPI(objectURL);
        setIsModified(true);

        if (file.size > maxSize) {
            toast.error(
                "Video file is larger than 10MB. Please upload a smaller file."
            );
            return;
        }

        if (video) {
            toast.error("You can only upload one video.");
            return;
        }

        setVideo(null);
        setVideoFile(file);
    };

    const handleVideoDelete = () => {
        setVideo(null);
        setVideoFromAPI(null);
        setIsModified(true);
    };

    const handelCoverImageDelete = () => {
        setCoverImageFromAPI(null);
        setCoverImage(null);
        setIsModified(true);
    };

    const handlePlanImageUpload = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Image size should be under 10MB");
                return;
            }
            const updatedProjects = [...projects];
            updatedProjects[index].image = file;
            setProjects(updatedProjects);
        }
    };

    const handleProjectChange = (index, key, value) => {
        const updatedProjects = [...projects];
        updatedProjects[index][key] = value;
        setProjects(updatedProjects);
    };

    const [projects, setProjects] = useState([
        {
            price: "",
            bhk: "",
            area: "",
            area_in: "",
            area_type: "",
            image: "",
        },
    ]);

    // 2. Handle Add New Empty Property
    const handleAdd = () => {
        console.log("Projects:", projects);

        // Check if all fields are filled for each project
        const isValid = projects.every(
            (project) =>
                project.price &&
                project.bhk &&
                project.area &&
                project.area_in &&
                project.area_type &&
                project.image
        );

        if (!isValid) {
            toast.error("Please fill all fields before adding a new unit!");
            return;
        }

        // If all projects are valid, add a new empty project
        setProjects((prev) => [
            ...prev,
            {
                price: "",
                bhk: "",
                area: "",
                area_in: "",
                area_type: "",
                image: "",
            },
        ]);
    };

    const handleRemove = (index) => {
        setProjects(projects.filter((_, i) => i !== index));
    };

    const handlePlaceChanged = () => {
        const place = autoCompleteRef.current.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setLatitude(lat); // Save latitude
        setLongitude(lng); // Save longitude

        setAddress(place.formatted_address || "");

        const addressComponents = place.address_components;
        for (let comp of addressComponents) {
            const types = comp.types;
            if (types.includes("country")) setCountry(comp.long_name);
            if (types.includes("administrative_area_level_1"))
                setState(comp.long_name);
            if (types.includes("locality")) setCity(comp.long_name);
            if (types.includes("postal_code")) setZipCode(comp.long_name);
        }
    };

    //started to the edit project

    const [coverImageFromAPI, setCoverImageFromAPI] = useState(null);
    const [videoFromAPI, setVideoFromAPI] = useState(null);
    const [imagesFromAPI, setImagesFromAPI] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const res = await axios.post(
                    `${EP.CUST_API_GET_PROJECT_DETAILS}`,
                    { project_id: id }
                );

                const data = res.data.data.project_details;
                // Basic states
setProjectName(data.project_name || "");
setBuildingType(data.building_type || "");
setPropertyType(data.project_type || "");

setAddress(data.address || "");
setCity(data.city_name || "");
setState(data.state || "");
setCountry(data.country || "");
setZipCode(data.zip_code || "");

setLatitude(data.latitude || "");
setLongitude(data.longitude || "");

// Extra type states
setOfficeSubType(data.office_type || "");
setRetailSubType(data.office_type || "");
setRetailLocation(data.sub_sub_project_type || "");

setStorageType(data.office_type || "");
setIndustryType(data.office_type || "");
setHospitalityType(data.office_type || "");

setRetailWashroom(data.commercial_washroom || "");

// Configurations
setConfigurations(data.bhk_type || "");

// Construction
setConstructionStatus(data.construction_status || "");

// Description
setDescription(data.project_description || "");

                setFormData({
                     lift_availability: data.lift_availability || "",

        covered_parking:
          data.covered_parking === "0" ? "" : data.covered_parking || "",

        uncovered_parking:
          data.uncovered_parking === "0" ? "" : data.uncovered_parking || "",
        facing: data.facing || "",

        property_dimensions_breadth: data.property_dimensions_breadth || "",
        property_dimensions_length: data.property_dimensions_length || "",

        parking_availability: data.parking_availability || "",

        no_of_cabines: data.no_of_cabines || "",
        no_of_meeting_Rooms: data.no_of_meeting_Rooms || "",
        no_of_conference_room: data.no_of_conference_room || "",
        central_AC: data.central_AC || "",
        number_of_seats_available: data.number_of_seats_available || "",
        age_of_property: data.age_of_property || "",

        project_floor: data.project_floor || "",

        total_floor: data.total_floor || "",

        all_inclusive_price: data.all_inclusive_price || "",
        investment_options: data.investment_options || "",

        price_negotiable: data.price_negotiable || "",

        tax_and_goverment_charges: data.tax_and_goverment_charges || "",

        electricity_and_water_charges: data.electricity_and_water_charges || "",
        project_name: data.project_name || "",
        possession_date: data.possession_date || "",
        type_of_construction: data.type_of_construction || "",
        possession_by: data.possession_by || "",
        no_of_open_sides: data.no_of_open_sides || "",
        building_type: data.building_type || "Residential",
        purchase_type: data.purchase_type || "",

        project_type: data.project_type || "",

        address: data.address || "",

        city_name: data.city_name || "",

        state: data.state || "",

        country: data.country || "",

        zip_code: data.zip_code || "",

        latitude: data.latitude || "",

        longitude: data.longitude || "",

        office_type: data.office_type || "",

        land_type: data.land_type || "",

        furnished_type: data.furnished_type || "",

        bathroom: data.bathroom || "",

        washroom: data.washroom || "",

        sub_sub_project_type: data.sub_sub_project_type || "",

        construction_status: data.construction_status || "",

        launch_date: data.launch_date || "",

        possession_start: data.possession_start || "",

        rera_id: data.rera_id || "",
        mark_as_featured: data.mark_as_featured || "",

        project_description: data.project_description || "",

        average_project_price: data.average_project_price || "",

        bhk_type: data.bhk_type || "",

        area: data.area || "",

        area_in: data.area_in || "",

        carpet_area: data.carpet_area || "",

        carpet_area_unit: data.carpet_area_unit || "",

        total_project_size: data.total_project_size || "",

        total_beds: data.total_beds || "",

        parking_types: data.parking_types || "",

        available_from: data.available_from || "",

        available_on: data.available_on || "",

        builder_floor_type: data.builder_floor_type || "",

        pantry_option: data.pantry_option || "",

        possession_status: data.possession_status || "",

        reception_area: data.reception_area || "",

        balcony: data.balcony || "",

        additional_rooms: data.additional_rooms
          ? data.additional_rooms.split(",")
          : [],

                    project_name: data.project_name,
                    mark_as_featured: data.mark_as_featured,
                    building_type: data.building_type,
                    project_type: data.project_type,
                    address: data.address,
                    city_name: data.city_name,
                    country: data.country,
                    state: data.state,
                    zip_code: data.zip_code,
                    connect_to_name: data.connect_to_name,
                    connect_to_no: data.connect_to_no,
                    connect_to_email: data.connect_to_email,
                    total_project_size: data.total_project_size,
                    // Conditionally add launch_date and possession_start
                    ...(data.construction_status === "Ongoing" && {
                        launch_date: data.launch_date,
                        possession_start: data.possession_start,
                    }),
                    construction_status: data.construction_status,
                    rera_id: data.rera_id,
                    project_description: data.project_description,
                    video_url: data.video_url,
                    video_url_type: data.video_url_type,
                    floor_living_dining: data.floor_living_dining,
                    floor_kitchen_toilet: data.floor_kitchen_toilet,
                    floor_bedroom: data.floor_bedroom,
                    floor_balcony: data.floor_balcony,
                    walls_living_dining: data.walls_living_dining,
                    walls_kitchen_toilet: data.walls_kitchen_toilet,
                    walls_servant_room: data.walls_servant_room,
                    ceiling: data.ceiling,
                    ceilings_servant_room: data.ceilings_servant_room,
                    counters_kitchen_toilet: data.counters_kitchen_toilet,
                    fittings_fixtures_kitchen_toilet:
                        data.fittings_fixtures_kitchen_toilet,
                    fittings_fixtures_servant_room_toilet:
                        data.fittings_fixtures_servant_room_toilet,
                    door_window_internal_door: data.door_window_internal_door,
                    door_window_external_glazing: data.door_window_external_glazing,
                    electrical: data.electrical,
                    backup: data.backup,
                    security_system: data.security_system,
                    project_description: data.project_description,
                    virtual_tour_availability: data.virtual_tour_availability
                });

                setProjects(res.data.data.project_properties);
                setPropertyType(data.project_type);

                console.log("Fetched Amenities:", data.amenities);

                if (data.amenities && typeof data.amenities === "string") {
                    const amenityIds = data.amenities.split(",");
                    setSelectedAmenities(amenityIds);
                }

                setCoverImageFromAPI(data.cover_image);
                setVideoFromAPI(data.property_video);
                setImagesFromAPI(res.data.data.project_images);

                //Set brochure_doc
                setBrochureDocFromAPI(data.brochure_doc);

                // Project Logo
                setLogo(data.logo);

            } catch (error) {
                console.error("Error fetching project details", error);
            }
        };

        fetchProjectDetails();
    }, [id]);

    const handleInputChange = (keyOrEvent, value) => {
    if (typeof keyOrEvent === "string") {
      setFormData((prev) => ({
        ...prev,
        [keyOrEvent]: value,
      }));
    } else {
      const { name, value } = keyOrEvent.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

   useEffect(() => {
    const countries = Country.getAllCountries();
    setAllCountries(countries);
  }, []);

  useEffect(() => {
    if (country) {
      const states = State.getStatesOfCountry(country);
      setAllStates(states);
    } else {
      setAllStates([]);
    }
  }, [country]);

   const formatAverageProjectPrice = (price) => {
    if (!price) return "";

    if (typeof price === "string" && price.includes("-")) {
      const parts = price.split("-").map((p) => p.trim());
      return (
        <>
          {parts.map((p, idx) => {
            const num = parseInt(p);
            if (isNaN(num)) return null;

            return (
              <span key={idx} className="inline-flex items-center">
                <FaRupeeSign className="inline-block mr-1" />
                {num}
                {idx === 0 && " - "}
              </span>
            );
          })}
        </>
      );
    }

    const num = parseInt(price);
    if (isNaN(num)) return "";

    return (
      <span className="inline-flex items-center">
        <FaRupeeSign className="inline-block mr-1" />
        {num}
      </span>
    );
  };

    //update/edit project

    const [isModified, setIsModified] = useState(false);

    const handleEditProject = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            const form = new FormData();
            form.append("project_id", id);

            formData.amenities = selectedAmenities.join(",");

            // Cover image
            if (coverImage) {
                form.append("cover_image", coverImage);
            } else if (coverImageFromAPI === null) {
                form.append("cover_image", ""); // Treat as delete
            }

            // Property video
            if (video) {
                form.append("property_video", video);
            } else if (videoFromAPI === null) {
                form.append("property_video", "");
            }

            // Append new uploaded image files
            fileData.forEach((file) => {
                form.append("new_images[]", file);
            });

            // Append deleted old image IDs
            deletedImageIds.forEach((id) => {
                form.append("deleted_images[]", id);
            });

            // Append logo only if it's a valid File object
            if (logo instanceof File) {
                form.append("logo", logo);
            }

            if (brochureDoc) {
                form.append("brochure_doc", brochureDoc);
            }

            const fields = [
                "project_type",
"building_type",

"office_type",
"land_type",

"sub_sub_project_type",

"commercial_washroom",

"parking_types",

"bhk_type",

"bathroom",

"area",
"area_in",

"carpet_area",
"carpet_area_unit",

"possession_status",
"possession_date",

"total_floor",
"project_floor",
"covered_parking",
"uncovered_parking",
                "project_name",
                "mark_as_featured",
                "address",
                "country",
                "state",
                "city_name",
                "zip_code",
                "latitude",
                "longitude",
                "total_project_size",
                "average_project_price",
                "congfigurations",
                "construction_status",
                "rera_id",
                "floor_living_dining",
                "floor_kitchen_toilet",
                "floor_bedroom",
                "floor_balcony",
                "walls_living_dining",
                "walls_kitchen_toilet",
                "walls_servant_room",
                "ceiling",
                "ceilings_servant_room",
                "counters_kitchen_toilet",
                "fittings_fixtures_kitchen_toilet",
                "fittings_fixtures_servant_room_toilet",
                "door_window_internal_door",
                "door_window_external_glazing",
                "electrical",
                "backup",
                "security_system",
                "project_description",
                "amenities",
                "cover_image",
                "property_video",
                "video_url_type",
                "video_url",
                "available_status",
                "flat_name",
                "near_landmark",
            ];

            fields.forEach((field) => {
                if (
                    formData[field] !== undefined &&
                    formData[field] !== null &&
                    formData[field] !== ""
                ) {
                    form.append(field, formData[field]);
                }
            });

            // Conditionally append launch_date and possession_start
            if (formData.construction_status === "Ongoing") {
                if (formData.launch_date) {
                    form.append("launch_date", formData.launch_date);
                }
                if (formData.possession_start) {
                    form.append("possession_start", formData.possession_start);
                }
            }

            const res = await axios.post(
                `${EP.CUST_API_EDIT_PROJECT}`,
                form
            );

            if (res.data?.status === 1) {
                toast.success("Project updated successfully");
                setActiveStep(activeStep + 1);
                setIsModified(false);

                //  Upload images after project update
                if (fileData.length > 0) {
                    const imageFormData = new FormData();
                    imageFormData.append("project_id", id);

                    fileData.forEach((file) => {
                        console.log("Uploading file:", file);
                        imageFormData.append("project_image", file);
                    });

                    try {
                        const imageRes = await fetch(
                            `${EP.CUST_API_ADD_PROJECT_IMAGES}`,
                            {
                                method: "POST",
                                body: imageFormData,
                            }
                        );

                        const imageData = await imageRes.json();

                        if (imageRes.ok) {
                            toast.success("Images uploaded successfully!");
                            // setFileData([]); // Clear after upload
                        } else {
                            toast.error("Image upload failed");
                            console.error("Image upload error:", imageData);
                        }
                    } catch (error) {
                        toast.error("Error uploading images");
                        console.error("Upload error:", error);
                    }
                }
                navigate({
                    pathname: "/projects"
                });
            } else {
                toast.error("Update failed");
            }
        } catch (err) {
            toast.error("Error updating project");
            console.error(err);
            navigate({
                pathname: "/projects",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveNewImage = (index) => {
        const updated = [...fileData];
        updated.splice(index, 1);
        setFileData(updated);
    };

    useEffect(() => {
        const countries = Country.getAllCountries();
        setAllCountries(countries);
    }, []);

    useEffect(() => {
        if (formData.country) {
            const states = State.getStatesOfCountry(formData.country);
            setAllStates(states);
        } else {
            setAllStates([]);
        }
    }, [formData.country]);

    useEffect(() => {
        if (formData.country && formData.country.length > 2) {
            const found = Country.getAllCountries().find(
                (c) => c.name.toLowerCase() === formData.country.toLowerCase()
            );
            if (found) {
                setFormData((prev) => ({
                    ...prev,
                    country: found.isoCode,
                }));
            }
        }
    }, [formData.country]);


    return (
        <>
            <div className="w-100 container-fluid mt-28">
                <nav className="flex justify-end mb-4" aria-label="Breadcrumb">
                        <ol className="flex flex-wrap items-center space-x-2 text-sm md:space-x-4">
                          <li>
                            <Link
                              to="/projects"
                              className="font-medium text-blue-600 transition-colors hover:underline"
                            >
                              Go To Projects
                            </Link>
                          </li>
                
                
                          <li className="text-gray-400">/</li>
                        </ol>
                      </nav>
                <div className="flex flex-col items-center min-h-screen bg-white">
                    {/* Navbar */}
                    <nav className="items-center justify-center hidden w-full p-4 text-black bg-gray-200 md:flex">
                        <h1 className="text-xl">Edit Project</h1>
                    </nav>

                    {/* Stepper Navigation */}
                    <div className="flex justify-center p-3 space-x-4 bg-white">
                        {steps.map((step, index) => (
                            <button
                                key={index}
                                className={`px-4 py-3 rounded-full text-sm font-medium transition ${activeStep === index
                                    ? "bg-gray-200 text-purple-600"
                                    : "text-gray-600 "
                                    }`}
                                onClick={() => setActiveStep(index)}
                            >
                                {index + 1}. {step}
                            </button>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="w-full max-w-full p-6 bg-white">
                        {/* <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {steps[activeStep]}
          </h2> */}

                        {/* Render Step Content */}
                   {activeStep === 0 && (
            <>
              <div className="max-w-3xl p-3 mx-auto mb-20 border border-gray-300 rounded-xl">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">
                  Basic Details
                </h2>

                {/* Property Name */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Project Name{" "}
                    <span className="text-xl font-bold text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Project Name"
                    value={formData.project_name || ""}
                    onChange={(e) => {
                      const value = e.target.value;

                      const alphaNumericOnly = value.replace(
                        /[^a-zA-Z0-9 ]/g,
                        "",
                      );

                      setProjectName(alphaNumericOnly);

                      setFormData((prev) => ({
                        ...prev,
                        project_name: alphaNumericOnly,
                      }));
                    }}
                    className={`w-full p-3 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 ${
                      errors.projectName
                        ? "border border-red-600"
                        : "border border-gray-300"
                    }`}
                  />
                  {errors.projectName && (
                    <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                      <MdErrorOutline className="text-lg" />
                      {errors.projectName}
                    </p>
                  )}
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="featured"
                    className="mr-2 mb-2"
                    checked={formData.mark_as_featured || false}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        mark_as_featured: e.target.checked,
                      });
                      setIsModified(true);
                    }}
                  />
                  <label
                    htmlFor="featured"
                    className="text-gray-700 flex items-center"
                  >
                    Showcase Your Project in the Top Projects
                    <IoIosInformationCircle className="text-yellow-500 ml-1 cursor-pointer text-lg" />
                  </label>
                </div>
                {/* Featured Checkbox */}
                {/* <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="featured"
                    className="mb-2 mr-2"
                    checked={isFeatured}
                    onChange={(e) => {
                      if (e.target.checked && featureCount === 0) {
                        setShowFeaturePopup(true);
                      } else {
                        setIsFeatured(e.target.checked);
                      }
                    }}
                  />
                  <label
                    htmlFor="featured"
                    className="flex items-center text-gray-700"
                  >
                    Showcase Your Project in the Top Projects{" "}
                    <IoIosInformationCircle className="ml-1 text-lg text-yellow-500 cursor-pointer" />
                  </label>
                </div> */}

                {/* Building Type */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Building Type
                  </label>

                  <div className="flex gap-3">
                    {["Residential", "Commercial"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setBuildingType(type); // change type
                          setPropertyType(""); // reset property type

                          //  IMPORTANT: reset only extra fields (not all)
                          setFormData((prev) => ({
                            ...prev,

                            bhk_type: "",
                            office_type: "",
                            land_type: "",

                            sub_sub_project_type: "",
                            washroom: "",
                            parking_types: "",

                            total_number_of_rooms: "",
                            quality_rating: "",

                            no_of_cabines: "",
                            no_of_meeting_Rooms: "",
                            no_of_conference_room: "",

                            central_AC: "",
                            reception_area: "",

                            available_for: "",
                            room_type: "",
                            no_of_peoples: "",
                            total_beds: "",
                            available_beds: "",

                            attached_balcony: "",
                            attached_bathroom: "",
                          }));
                        }}
                        className={`px-4 py-2 rounded-full border ${
                          buildingType === type
                            ? "bg-rose-100 text-rose-700 border-rose-500"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">
                    Project Type{" "}
                    <span className="text-xl font-bold text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <div className="flex flex-wrap gap-1">
                      {(buildingType === "Residential"
                        ? residentialTypes
                        : commercialTypes
                      ).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
  setPropertyType(type);

  setFormData((prev) => ({
    ...prev,
    project_type: type,
  }));
}}
                          className={`px-4 py-2 rounded-full border ${
                            propertyType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {type === "Plot/Land" ? "Land" : type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {propertyType === "Hospitality" && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      What kind of hospitality?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {hospitalityOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            hospitalityType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setHospitalityType(type);

                            setFormData((prev) => ({
                              ...prev,
                              office_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {propertyType === "Plot/Land" && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      What kind of land?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {landOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            landType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setLandType(type);

                            setFormData((prev) => ({
                              ...prev,
                              land_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {propertyType === "Industry" && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      What kind of industry?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {industryOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            industryType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setIndustryType(type);

                            setFormData((prev) => ({
                              ...prev,
                              office_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {propertyType === "Storage" && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      What kind of storage?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {storageOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            storageType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setStorageType(type);

                            setFormData((prev) => ({
                              ...prev,
                              office_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {propertyType === "Office" && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      What kind of office?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {officeOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            officeSubType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setOfficeSubType(type);

                            setFormData((prev) => ({
                              ...prev,
                              office_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {propertyType === "Retail" && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      What kind of retail?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {retailOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            RetailSubType === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setRetailSubType(type);
                            setFormData((prev) => ({
                              ...prev,
                              office_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {propertyType === "Retail" && RetailSubType && (
                  <div className="mt-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      Your Retail located inside?
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {retailLocationOptions.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`px-4 py-2 rounded-full border transition ${
                            retailLocation === type
                              ? "bg-rose-100 text-rose-700 border-rose-500"
                              : "border-gray-300 text-gray-600 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setRetailLocation(type);
                            setFormData((prev) => ({
                              ...prev,
                              sub_sub_project_type: type,
                            }));
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeStep === 1 && (
            <>
              <div className="max-w-5xl mx-auto mb-32 bg-white rounded-xl">
                <h2 className="text-2xl text-gray-900">Project Address</h2>
                <p className="mt-1 text-gray-500">
                  Place the listing pin on the map
                </p>
                <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                  {/* <div className="w-full overflow-hidden bg-gray-200 rounded-lg h-80">
                             <LoadScript
                               googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                               libraries={["places"]}
                             >
                               <GoogleMap
                                 mapContainerStyle={{ width: "100%", height: "100%" }}
                                 center={mapCenter}
                                 zoom={14}
                               >
                                 <Marker position={mapCenter} />
                               </GoogleMap>
                             </LoadScript>
                           </div> */}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="font-medium text-gray-700">
                        Address{" "}
                        <span className="text-xl font-bold text-red-500">
                          *
                        </span>
                      </label>
                      <LoadScript
                        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                        libraries={["places"]}
                      >
                        <Autocomplete
                          onLoad={(ac) => (autoCompleteRef.current = ac)}
                          onPlaceChanged={handlePlaceChanged}
                        >
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);

                              setFormData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }));
                            }}
                            className={`w-full border rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none ${
                              errors.address
                                ? "border-red-600"
                                : "border-gray-300"
                            }`}
                          />
                        </Autocomplete>

                        {errors.address && (
                          <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                            <MdErrorOutline className="text-lg" />
                            {errors.address}
                          </p>
                        )}
                      </LoadScript>
                    </div>

                    {/* Country Dropdown */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Country{" "}
                        <span className="text-xl font-bold text-red-500">
                          *
                        </span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          setState("");

                          setFormData((prev) => ({
                            ...prev,
                            country: e.target.value,
                            state: "",
                          }));
                        }}
                        className={`w-full border rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none ${
                          errors.country ? "border-red-600" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select Country</option>
                        {allCountries.map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {errors.country && (
                        <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <MdErrorOutline className="text-lg" />
                          {errors.country}
                        </p>
                      )}
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="font-medium text-gray-700">
                        State{" "}
                        <span className="text-xl font-bold text-red-500">
                          *
                        </span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);

                          setFormData((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }));
                        }}
                        className={`w-full border rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none ${
                          errors.state ? "border-red-600" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select State</option>
                        {allStates.map((s) => (
                          <option key={s.isoCode} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <MdErrorOutline className="text-lg" />
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="font-medium text-gray-700">
                        City{" "}
                        <span className="text-xl font-bold text-red-500">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);

                          setFormData((prev) => ({
                            ...prev,
                            city_name: e.target.value,
                          }));
                        }}
                        placeholder="Enter City"
                        className={`w-full border rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none ${
                          errors.city ? "border-red-600" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <MdErrorOutline className="text-lg" />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Zip <span className="text-xl text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={zipCode}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (/^\d{0,10}$/.test(value)) {
                            setZipCode(value);

                            setFormData((prev) => ({
                              ...prev,
                              zip_code: value,
                            }));
                          }
                        }}
                        className={`w-full border rounded-md p-3 text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none ${
                          errors.zipCode ? "border-red-600" : "border-gray-300"
                        }`}
                      />
                      {errors.zipCode && (
                        <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <MdErrorOutline className="text-lg" />
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
         {activeStep === 2 && (
                     <>
                       <div className="p-3 mx-auto mb-3 bg-white border max-w-7xl rounded-xl">
                         <div className="mb-6">
                           <h2 className="text-2xl font-semibold text-gray-900">
                             Project Details
                           </h2>
                           <p className="text-gray-500">
                             Enter and manage essential information related to your
                             project Properties.
                           </p>
                         </div>
         
                         <div className="grid items-start grid-cols-6 gap-4 p-4 mt-4 rounded-lg">
                           {/* Property Price */}
                           <div className="w-full">
                             <label className="block mb-0 text-sm font-medium text-gray-700">
                               Price{" "}
                               <span className="text-xl font-bold text-red-500">*</span>
                             </label>
                             <input
                               type="text"
                               value={formData.average_project_price || ""}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 if (/^\d{0,20}$/.test(value)) {
                                   handleInputChange("average_project_price", value);
                                 }
                               }}
                               placeholder="₹"
                               className="w-full mt-1 p-3 border rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-rose-500"
                             />
                             {errors.average_project_price && (
                               <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                                 <MdErrorOutline className="text-lg" />
                                 {errors.average_project_price}
                               </p>
                             )}
                           </div>
         
                           {/* BHK */}
                          {!(
           buildingType === "Commercial" ||
           propertyType === "Plot/Land"
         ) && (
           <div className="w-full">
             <label className="block mb-1 text-sm font-medium text-gray-700">
               BHK{" "}
               <span className="text-xl font-bold text-red-500">
                 *
               </span>
             </label>
         
             <select
               value={formData.bhk_type || ""}
               onChange={(e) => {
                 handleInputChange("bhk_type", e.target.value);
                 setConfigurations(e.target.value);
               }}
               className="w-full mt-1 p-3 border rounded-lg text-gray-700 outline-none focus:ring-2 focus:ring-rose-500"
             >
               <option value="">Select BHK Type</option>
         
               {(
                 propertyType === "1RK/Studio Apartment"
                   ? ["1 BHK"]
                   : [
                       "Studio",
                       "1 BHK",
                       "1.5 BHK",
                       "2 BHK",
                       "2.5 BHK",
                       "3 BHK",
                       "3.5 BHK",
                       "4 BHK",
                       "5 BHK",
                       "6 BHK",
                       "6+ BHK",
                     ]
               ).map((bhk) => (
                 <option key={bhk} value={bhk}>
                   {bhk}
                 </option>
               ))}
             </select>
         
             {errors.bhk_type && (
               <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                 <MdErrorOutline className="text-lg" />
                 {errors.bhk_type}
               </p>
             )}
           </div>
         )}
                           {/* Built-up Area */}
                           <div>
                             <label className="font-medium text-gray-700">
                               Built-up Area <span className="text-red-500">*</span>
                             </label>
                             <input
                               type="text"
                               value={formData.area || ""}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 if (/^\d{0,10}$/.test(value)) {
                                   handleInputChange("area", value);
                                 }
                               }}
                               className="w-full mt-1 p-3 border rounded-lg"
                             />
                           </div>
         
                           <div>
                             <label className="font-medium text-gray-700">Unit</label>
                             <select
                               value={formData.area_in || ""}
                               onChange={(e) =>
                                 handleInputChange("area_in", e.target.value)
                               }
                               className="w-full mt-1 p-3 border rounded-lg"
                             >
                               <option value="">Select</option>
                               <option value="sq.ft">sq.ft</option>
                               <option value="sq.yards">sq.yards</option>
                               <option value="sq.m">sq.m</option>
                               <option value="acre">acre</option>
                               <option value="marla">marla</option>
                               <option value="cents">cents</option>
                               <option value="bigha">bigha</option>
                               <option value="kottah">kottah</option>
                               <option value="kanal">kanal</option>
                               <option value="grounds">grounds</option>
                               <option value="ares">ares</option>
                               <option value="biswa">biswa</option>
                               <option value="guntha">guntha</option>
                               <option value="aankadam">aankadam</option>
                               <option value="hectares">hectares</option>
                               <option value="rood">rood</option>
                               <option value="chataks">chataks</option>
                               <option value="perch">perch</option>
                             </select>
                           </div>
         
                           {/* Carpet Area */}
                           <div>
                             <label className="font-medium text-gray-700">
                               Carpet Area <span className="text-red-500">*</span>
                             </label>
                             <input
                               type="text"
                               value={formData.carpet_area || ""}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 if (/^\d{0,10}$/.test(value)) {
                                   handleInputChange("carpet_area", value);
                                 }
                               }}
                               className="w-full mt-1 p-3 border rounded-lg"
                             />
                           </div>
         
                           <div>
                             <label className="font-medium text-gray-700">Unit</label>
                             <select
                               value={formData.carpet_area_unit || ""}
                               onChange={(e) =>
                                 handleInputChange("carpet_area_unit", e.target.value)
                               }
                               className="w-full mt-1 p-3 border rounded-lg"
                             >
                               <option value="">Select</option>
                               <option value="sq.ft">sq.ft</option>
                               <option value="sq.yards">sq.yards</option>
                               <option value="sq.m">sq.m</option>
                               <option value="acre">acre</option>
                               <option value="marla">marla</option>
                               <option value="cents">cents</option>
                               <option value="bigha">bigha</option>
                               <option value="kottah">kottah</option>
                               <option value="kanal">kanal</option>
                               <option value="grounds">grounds</option>
                               <option value="ares">ares</option>
                               <option value="biswa">biswa</option>
                               <option value="guntha">guntha</option>
                               <option value="aankadam">aankadam</option>
                               <option value="hectares">hectares</option>
                               <option value="rood">rood</option>
                               <option value="chataks">chataks</option>
                               <option value="perch">perch</option>
                             </select>
                           </div>
         
                           {!(
                             (buildingType === "Residential" &&
                               propertyType === "Plot") ||
                             (buildingType === "Commercial" &&
                               [
                                 "Land",
                                 "Storage",
                                 "Hospitality",
                                 "Industry",
                                 "Retail",
                                 "Warehouse",
                                 "Plot/Land",
                               ].includes(propertyType))
                           ) && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Bathroom
                               </label>
         
                               <select
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                                 value={formData.bathroom || ""}
                                 onChange={(e) =>
                                   setFormData({
                                     ...formData,
                                     bathroom: Number(e.target.value), // convert to integer
                                   })
                                 }
                               >
                                 <option value="">Select Bathrooms</option>
                                 <option value="0">0</option>
                                 <option value="1">1</option>
                                 <option value="2">2</option>
                                 <option value="3">3</option>
                                 <option value="4">4</option>
                               </select>
                             </div>
                           )}
                           {buildingType === "Commercial" &&
                             propertyType === "Retail" && (
                               <div>
                                 <label className="font-medium text-gray-700">
                                   Washroom
                                 </label>
         
                                 <select
                                   value={retailWashroom}
                                   onChange={(e) => {
                                     setRetailWashroom(e.target.value);
         
                                     setFormData((prev) => ({
                                       ...prev,
                                       commercial_washroom: e.target.value,
                                     }));
                                   }}
                                   className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                                 >
                                   <option value="">Select Washroom</option>
                                   <option value="Private Washrooms">
                                     Private Washrooms
                                   </option>
                                   <option value="Public Washrooms">
                                     Public Washrooms
                                   </option>
                                   <option value="Not Available">Not Available</option>
                                 </select>
                               </div>
                             )}
                           {buildingType === "Commercial" &&
                             ["Storage", "Industry", "Hospitality"].includes(
                               propertyType,
                             ) && (
                               <div>
                                 <label className="font-medium text-gray-700">
                                   Washroom
                                 </label>
         
                                 <select
                                   name="washroom"
                                   value={formData.commercial_washroom}
                                   onChange={handleInputChange}
                                   className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                                 >
                                   <option value="">Select Washrooms</option>
                                   <option value="None">None</option>
                                   <option value="Shared">Shared</option>
                                   <option value="1">1</option>
                                   <option value="2">2</option>
                                   <option value="3">3</option>
                                   <option value="4">4</option>
                                   <option value="4+">4+</option>
                                 </select>
                               </div>
                             )}
         
                           <div className="md:col-span-3 mt-2">
                             {/* <label className="font-medium text-gray-700">
                               Price Details
                             </label> */}
         
                             <div className="flex flex-wrap gap-4 mt-2">
                               {/* All Inclusive Price */}
                               <label className="flex items-center gap-2">
                                 <input
                                   type="checkbox"
                                   checked={formData.all_inclusive_price === "Yes"}
                                   onChange={(e) =>
                                     setFormData({
                                       ...formData,
                                       all_inclusive_price: e.target.checked
                                         ? "Yes"
                                         : "No",
                                     })
                                   }
                                 />
                                 All Inclusive Price
                               </label>
         
                               {/* Price Negotiable */}
                               <label className="flex items-center gap-2">
                                 <input
                                   type="checkbox"
                                   checked={formData.price_negotiable === "Yes"}
                                   onChange={(e) =>
                                     setFormData({
                                       ...formData,
                                       price_negotiable: e.target.checked ? "Yes" : "No",
                                     })
                                   }
                                 />
                                 Price Negotiable
                               </label>
         
                               {/* Tax & Govt Charges */}
                               <label className="flex items-center gap-2">
                                 <input
                                   type="checkbox"
                                   checked={formData.tax_and_goverment_charges === "Yes"}
                                   onChange={(e) =>
                                     setFormData({
                                       ...formData,
                                       tax_and_goverment_charges: e.target.checked
                                         ? "Yes"
                                         : "No",
                                     })
                                   }
                                 />
                                 Tax & Government Charges Excluded
                               </label>
                             </div>
                           </div>
                         </div>
                       </div>
         
                       <div className="p-3 mx-auto mb-3 bg-white border max-w-7xl rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {/*  Header full width */}
                         <div className="mb-6 col-span-1 md:col-span-2 lg:col-span-4">
                           <h2 className="text-2xl font-semibold text-gray-900">
                             More Details
                           </h2>
                           <p className="text-gray-500">
                             Comprehensive overview covering scale, financials, features,
                             timeline, and compliance of the project
                           </p>
                         </div>
         
                         {/* {buildingType === "Commercial" &&
                           !["Land", "Plot/Land"].includes(propertyType) && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Security Deposit Amount{" "}
                                 <span className="text-xl font-bold text-red-500">
                                   *
                                 </span>
                               </label>
         
                               <input
                                 type="text"
                                 name="custom_deposit_amount"
                                 value={formData.custom_deposit_amount || ""}
                                 onChange={(e) => {
                                   const value = e.target.value;
         
                                   if (/^\d{0,10}$/.test(value)) {
                                     handleInputChange(e);
                                   }
                                 }}
                                 placeholder="Enter Security Deposit Amount"
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               />
         
                               {errors?.custom_deposit_amount && (
                                 <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                                   <MdErrorOutline className="text-lg" />
                                   {errors.custom_deposit_amount}
                                 </p>
                               )}
                             </div>
                           )} */}
                         <div>
           <label className="font-medium text-gray-700">
             Possession Status
           </label>
         
           <select
             className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
             value={formData.possession_status || ""}
             onChange={(e) =>
               setFormData({
                 ...formData,
                 possession_status: e.target.value,
               })
             }
           >
             <option value="">Select Status</option>
         
             <option value="Ready To Move">
               Ready To Move
             </option>
         
             <option value="Under Construction">
               Under Construction
             </option>
           </select>
         
           {errors?.possession_status && (
             <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
               <MdErrorOutline className="text-lg" />
               {errors.possession_status}
             </p>
           )}
         </div>
                         {formData.possession_status === "Under Construction" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Possession Date{" "}
                              
                             </label>
         
                             <input
                               type="date"
                               value={formData.possession_date || ""}
                               onChange={(e) =>
                                 setFormData({
                                   ...formData,
                                   possession_date: e.target.value,
                                 })
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             />
         
                             {errors?.possession_date && (
                               <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                                 <MdErrorOutline className="text-lg" />
                                 {errors.possession_date}
                               </p>
                             )}
                           </div>
                         )}
                          {!(
                           (buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             [
                               "Land",
                               "Plot/Land",
                               "Warehouse",
                               "Storage",
                               "Industry",
                               "Hospitality",
                             ].includes(propertyType))
                         ) && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Total Floor
                             </label>
         
                             <input
                               type="text"
                               name="total_floor"
                               value={formData.total_floor}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 if (/^[a-zA-Z0-9]{0,10}$/.test(value)) {
                                   handleInputChange(e);
                                 }
                               }}
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             />
                           </div>
                         )}
                         {!(
           (buildingType === "Residential" && propertyType === "Plot") ||
           (buildingType === "Commercial" &&
             [
               "Land",
               "Plot/Land",
               "Warehouse",
               "Industry",
               "Storage",
               "Hospitality",
             ].includes(propertyType))
         ) && (
           <div>
             <label className="font-medium text-gray-700">
               Floor Number
             </label>
         
             <select
               name="project_floor"
               value={formData.project_floor || ""}
               onChange={handleInputChange}
               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
             >
               <option value="">Select Floor</option>
         
               <option value="Lower Basement">
                 Lower Basement
               </option>
         
               <option value="Basement">
                 Basement
               </option>
         
               <option value="Lower Ground">
                 Lower Ground
               </option>
         
               <option value="Ground">
                 Ground
               </option>
         
               <option value="Rooftop/Terrace">
                 Rooftop/Terrace
               </option>
         
               {[...Array(Number(formData.total_floor) || 0)].map((_, index) => (
                 <option
                   key={index + 1}
                   value={`${index + 1}`}
                 >
                   {index + 1}
                 </option>
               ))}
         
               
             </select>
           </div>
         )}
                         {/* {[
                           "Apartment",
                           "1RK/Studio Apartment",
                           "Service Apartment",
                           "Office",
                         ].includes(propertyType) && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Total Number of Parking
                             </label>
         
                             <input
                               type="text"
                               value={formData.total_number_parking || ""}
                               onChange={(e) =>
                                 handleInputChange(
                                   "total_number_parking",
                                   e.target.value,
                                 )
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               placeholder="Enter total parking"
                             />
                           </div>
                         )} */}
                         {buildingType === "Commercial" &&
           propertyType === "Retail" && (
             <div>
               <label className="font-medium text-gray-700">
                 Parking Type
               </label>
         
               <Select
                 isMulti
                 name="parking_types"
                 options={[
                   {
                     value: "Private Parking",
                     label: "Private Parking",
                   },
                   {
                     value: "Public Parking",
                     label: "Public Parking",
                   },
                   {
                     value: "Multilevel Parking",
                     label: "Multilevel Parking",
                   },
                   {
                     value: "Not Available",
                     label: "Not Available",
                   },
                 ]}
                 value={[
                   {
                     value: "Private Parking",
                     label: "Private Parking",
                   },
                   {
                     value: "Public Parking",
                     label: "Public Parking",
                   },
                   {
                     value: "Multilevel Parking",
                     label: "Multilevel Parking",
                   },
                   // {
                   //   value: "Not Available",
                   //   label: "Not Available",
                   // },
                 ].filter((opt) =>
                   (formData.parking_types || "")
                     .split(",")
                     .includes(opt.value)
                 )}
                onChange={(selectedOptions) => {
           const values = selectedOptions.map(
             (opt) => opt.value
           );
         
           let finalValues = values;
         
           if (values.includes("Not Available")) {
             finalValues = ["Not Available"];
           }
         
           handleInputChange({
             target: {
               name: "parking_types",
               value: finalValues.join(","),
             },
           });
         }}
                 components={{ MultiValue: CustomMultiValue }}
                 placeholder="Select Parking Type"
                 classNamePrefix="react-select"
                 styles={{
                   control: (base, state) => ({
                     ...base,
                     minHeight: "60px",
                     padding: "6px",
                     borderColor: state.isFocused
                       ? "#a855f7"
                       : "#d1d5db",
                     boxShadow: state.isFocused
                       ? "0 0 0 2px #a855f7"
                       : "none",
                     borderRadius: "0.5rem",
                     fontSize: "16px",
                     display: "flex",
                     flexWrap: "nowrap",
                     overflowX: "auto",
                   }),
         
                   valueContainer: (base) => ({
                     ...base,
                     padding: "0 6px",
                     display: "flex",
                     flexWrap: "nowrap",
                     gap: "6px",
                     overflowX: "auto",
                     scrollbarWidth: "thin",
                     alignItems: "center",
                   }),
         
                   placeholder: (base) => ({
                     ...base,
                     color: "#1f2937",
                     fontSize: "16px",
                   }),
         
                   multiValue: (base) => ({
                     ...base,
                     backgroundColor: "#ede9fe",
                     borderRadius: "0.375rem",
                     display: "flex",
                     alignItems: "center",
                     padding: "2px 6px",
                     whiteSpace: "nowrap",
                   }),
         
                   multiValueLabel: (base) => ({
                     ...base,
                     color: "#6b21a8",
                     fontWeight: "500",
                   }),
         
                   multiValueRemove: (base) => ({
                     ...base,
                     color: "#6b21a8",
                     ":hover": {
                       backgroundColor: "#ddd6fe",
                       color: "#4c1d95",
                     },
                   }),
                 }}
               />
             </div>
         )}
                         {buildingType === "Commercial" && propertyType === "Office" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               No. of Cabines
                             </label>
         
                             <select
                               value={formData.no_of_cabines || ""}
                               onChange={(e) =>
                                 handleInputChange("no_of_cabines", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Cabines</option>
                               <option value="1">1</option>
                               <option value="2">2</option>
                               <option value="3">3</option>
                               <option value="4">4</option>
                               <option value="5">5</option>
                               <option value="10+">10+</option>
                             </select>
                           </div>
                         )}
                         {buildingType === "Commercial" && propertyType === "Office" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               No. of Meeting Rooms
                             </label>
         
                             <select
                               value={formData.no_of_meeting_Rooms || ""}
                               onChange={(e) =>
                                 handleInputChange("no_of_meeting_Rooms", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Meeting Rooms</option>
                               <option value="1">1</option>
                               <option value="2">2</option>
                               <option value="3">3</option>
                               <option value="4">4</option>
                               <option value="5+">5+</option>
                             </select>
                           </div>
                         )}
                         {buildingType === "Commercial" && propertyType === "Office" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               No. of Conference Room
                             </label>
         
                             <select
                               value={formData.no_of_conference_room || ""}
                               onChange={(e) =>
                                 handleInputChange(
                                   "no_of_conference_room",
                                   e.target.value,
                                 )
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Conference Room</option>
                               <option value="0">0</option>
                               <option value="1">1</option>
                               <option value="2">2</option>
                               <option value="3+">3+</option>
                             </select>
                           </div>
                         )}
                        
                         {buildingType === "Commercial" &&
                           propertyType === "Hospitality" && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Total Number of Rooms
                               </label>
         
                               <input
                                 type="text"
                                 value={formData.total_number_of_rooms || ""}
                                 onChange={(e) => {
                                   const value = e.target.value;
                                   if (/^\d*$/.test(value)) {
                                     handleInputChange("total_number_of_rooms", value);
                                   }
                                 }}
                                 placeholder="Enter Total Rooms"
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               />
                             </div>
                           )}
                         {buildingType === "Commercial" &&
                           propertyType === "Hospitality" && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Quality Rating
                               </label>
         
                               <select
                                 value={formData.quality_rating || ""}
                                 onChange={(e) =>
                                   handleInputChange("quality_rating", e.target.value)
                                 }
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Rating</option>
                                 <option value="No Rating">No Rating</option>
                                 <option value="1 Star">1 Star</option>
                                 <option value="2 Star">2 Star</option>
                                 <option value="3 Star">3 Star</option>
                                 <option value="4 Star">4 Star</option>
                                 <option value="5 Star">5 Star</option>
                                 <option value="6 Star">6 Star</option>
                                 <option value="7 Star">7 Star</option>
                               </select>
                             </div>
                           )}
         
                        {(
           (buildingType === "Residential" &&
             propertyType === "Plot") ||
           (buildingType === "Commercial" &&
             ["Land", "Plot/Land"].includes(propertyType))
         ) && (
           <div>
             <label className="font-medium text-gray-700">
               Facing
             </label>
         
             <select
               name="facing"
               value={formData.facing || ""}
               onChange={handleInputChange}
               className="w-full p-3 mt-1 border rounded-lg"
             >
               <option value="">Select Facing</option>
         
               <option value="East">East</option>
               <option value="West">West</option>
               <option value="North">North</option>
               <option value="South">South</option>
               <option value="North East">North East</option>
               <option value="North West">North West</option>
               <option value="South East">South East</option>
               <option value="South West">South West</option>
             </select>
           </div>
         )}
                         {buildingType === "Residential" &&
                           propertyType === "Independent/Builder Floor" && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Builder Floor Type{" "}
                                 <span className="text-red-500">*</span>
                               </label>
         
                               <select
                                 value={formData.builder_floor_type || ""}
                                 onChange={(e) =>
                                   handleInputChange(
                                     "builder_floor_type",
                                     e.target.value,
                                   )
                                 }
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Floor Type</option>
                                 {builderFloorOptions.map((item) => (
                                   <option key={item} value={item}>
                                     {item}
                                   </option>
                                 ))}
                               </select>
                             </div>
                           )}
                         {((buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             propertyType === "Plot/Land")) && (
                           <>
                             {/* Length */}
                             <div>
                               <label className="font-medium text-gray-700">
                                 Length of Plot (ft){" "}
                                 <span className="text-red-500">*</span>
                               </label>
         
                               <input
                                 type="text"
                                 value={formData.property_dimensions_length || ""}
                                 onChange={(e) => {
                                   const value = e.target.value;
                                   if (/^\d*$/.test(value)) {
                                     handleInputChange(
                                       "property_dimensions_length",
                                       value,
                                     );
                                   }
                                 }}
                                 placeholder="Enter Length"
                                 className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none ${
                                   errors?.property_dimensions_length
                                     ? "border-red-600"
                                     : "border-gray-300"
                                 }`}
                               />
         
                               {errors?.property_dimensions_length && (
                                 <p className="text-sm text-red-500 mt-1">
                                   {errors.property_dimensions_length}
                                 </p>
                               )}
                             </div>
         
                             {/* Breadth */}
                             <div>
                               <label className="font-medium text-gray-700">
                                 Breadth of Plot (ft){" "}
                                 <span className="text-red-500">*</span>
                               </label>
         
                               <input
                                 type="text"
                                 value={formData.property_dimensions_breadth || ""}
                                 onChange={(e) => {
                                   const value = e.target.value;
                                   if (/^\d*$/.test(value)) {
                                     handleInputChange(
                                       "property_dimensions_breadth",
                                       value,
                                     );
                                   }
                                 }}
                                 placeholder="Enter Breadth"
                                 className={`w-full p-3 mt-1 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none ${
                                   errors?.property_dimensions_breadth
                                     ? "border-red-600"
                                     : "border-gray-300"
                                 }`}
                               />
         
                               {errors?.property_dimensions_breadth && (
                                 <p className="text-sm text-red-500 mt-1">
                                   {errors.property_dimensions_breadth}
                                 </p>
                               )}
                             </div>
                           </>
                         )}
                         {((buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             propertyType === "Plot/Land")) && (
                           <div>
                             <label className="font-medium text-gray-700">
                               No. of Open Sides
                             </label>
         
                             <select
                               name="no_of_open_sides"
                               value={formData.no_of_open_sides || ""}
                               onChange={handleInputChange}
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Open Sides</option>
                               <option value="1">1</option>
                               <option value="2">2</option>
                               <option value="3">3</option>
                               <option value="4">4</option>
                             </select>
                           </div>
                         )}
                         {((buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             propertyType === "Plot/Land")) && (
                           <div>
                             <label className="block mb-2 font-medium text-gray-700">
                               Any Construction on Property
                             </label>
         
                             <select
                               name="type_of_construction"
                               value={formData.type_of_construction || ""}
                               onChange={handleInputChange}
                               className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Construction Type</option>
                               {constructionOptions.map((item) => (
                                 <option key={item} value={item}>
                                   {item}
                                 </option>
                               ))}
                             </select>
                           </div>
                         )}
                         {/* {((buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             propertyType === "Plot/Land")) && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Possession By
                             </label>
         
                             <select
                               value={formData.possession_by || ""}
                               onChange={(e) =>
                                 handleInputChange("possession_by", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Possession</option>
                               <option value="Immediate">Immediate</option>
                               <option value="Within 3 Months">Within 3 Months</option>
                               <option value="Within 6 Months">Within 6 Months</option>
                               <option value="By 2026">By 2026</option>
                               <option value="By 2027">By 2027</option>
                               <option value="By 2028">By 2028</option>
                               <option value="By 2029">By 2029</option>
                               <option value="By 2030">By 2030</option>
                               <option value="By 2031">By 2031</option>
                               <option value="By 2032">By 2032</option>
                             </select>
                           </div>
                         )} */}
                         {propertyType !== "Plot/Land" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Furnishing Type{" "}
                               <span className="text-xl font-bold text-red-500">*</span>
                             </label>
         
                             <select
                               value={formData.furnished_type || ""}
                               onChange={(e) =>
                                 setFormData((prev) => ({
                                   ...prev,
                                   furnished_type: e.target.value,
                                 }))
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Furnishing Type</option>
                               <option value="Furnished">Furnished</option>
                               <option value="Semi-Furnished">Semi-Furnished</option>
                               <option value="Unfurnished">Unfurnished</option>
                             </select>
         
                             {errors?.furnished_type && (
                               <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                                 <MdErrorOutline className="text-lg" />
                                 {errors.furnished_type}
                               </p>
                             )}
                           </div>
                         )}
                         {!(
           (buildingType === "Residential" && propertyType === "Plot") ||
           (buildingType === "Commercial" &&
             [
               "Land",
               "Plot/Land",
               "Industry",
               "Storage",
               "Hospitality",
             ].includes(propertyType)) ||
           formData.possession_status === "Under Construction"
         ) && (
           <div>
             <label className="font-medium text-gray-700">
               Age of Property
             </label>
         
             <select
               value={formData.age_of_property || ""}
               onChange={(e) =>
                 handleInputChange("age_of_property", e.target.value)
               }
               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
             >
               <option value="">Select Age of Property</option>
               <option value="0-1">0-1</option>
               <option value="2-4">2-4</option>
               <option value="5-7">5-7</option>
               <option value="8-10">8-10</option>
               <option value="10+">10+</option>
             </select>
           </div>
         )}
         
                         {!(
                           (buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             [
                               "Land",
                               "Plot/Land",
                               "Warehouse",
                               "Storage",
                               "Industry",
                               "Hospitality",
                             ].includes(propertyType))
                         ) && (
                           <div>
                             <label className="font-medium text-gray-700">Balcony</label>
         
                             <select
                               name="balcony"
                               value={formData.balcony || ""}
                               onChange={handleInputChange}
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select No. of Balconies</option>
                               <option value="0">0</option>
                               <option value="1">1</option>
                               <option value="2">2</option>
                               <option value="3">3</option>
                               <option value="more than 3">More than 3</option>
                             </select>
                           </div>
                         )}
                         {!(
                           (buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             [
                               "Land",
                               "Plot/Land",
                               "Warehouse",
                               "Storage",
                               "Industry",
                               "Hospitality",
                             ].includes(propertyType))
                         ) && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Lift Availability
                             </label>
         
                             <select
                               value={formData.lift_availability || ""}
                               onChange={(e) =>
                                 handleInputChange("lift_availability", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Lift Availability</option>
                               <option value="Yes">Yes</option>
                               <option value="No">No</option>
                             </select>
                           </div>
                         )}
                         {buildingType === "Commercial" &&
                           propertyType === "Office" &&
                           [
                             "Bare shell office space",
                             "Ready to move office space",
                           ].includes(officeSubType) && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Pantry
                               </label>
         
                               <select
                                 value={formData.pantry_option || ""}
                                 onChange={(e) =>
                                   handleInputChange("pantry_option", e.target.value)
                                 }
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Pantry</option>
                                 <option value="Wet">Wet</option>
                                 <option value="Dry">Dry</option>
                                 <option value="None">None</option>
                               </select>
                             </div>
                           )}
         
                        {buildingType === "Commercial" &&
           propertyType === "Office" && (
             <div>
               <label className="font-medium text-gray-700">
                 Central AC
               </label>
         
               <select
                 value={formData.central_AC || ""}
                 onChange={(e) =>
                   handleInputChange("central_AC", e.target.value)
                 }
                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
               >
                 <option value="">Select Option</option>
         
                 {formData.office_type === "Ready to move office space" ? (
                   <>
                     <option value="Available">
                       Available
                     </option>
         
                     <option value="Not Available">
                       Not Available
                     </option>
                   </>
                 ) : (
                   <>
                     <option value="Duct Only">
                       Duct Only
                     </option>
         
                     <option value="Available">
                       Available
                     </option>
         
                     <option value="Not Available">
                       Not Available
                     </option>
                   </>
                 )}
               </select>
             </div>
         )}
                         {buildingType === "Commercial" && propertyType === "Office" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Reception Area
                             </label>
         
                             <select
                               value={formData.reception_area || ""}
                               onChange={(e) =>
                                 handleInputChange("reception_area", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Option</option>
                               <option value="Yes">Yes</option>
                               <option value="No">No</option>
                             </select>
                           </div>
                         )}
         
                         {buildingType === "Commercial" &&
                           [
                             "Office",
                             "Retail",
                             "Storage",
                             "Industry",
                             "Hospitality",
                             "Other",
                           ].includes(propertyType) && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Investment Option
                               </label>
         
                               <select
                                 name="investment_options"
                                 value={formData.investment_options || ""}
                                 onChange={handleInputChange}
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Investment Option</option>
                                 <option value="Pre-Leased Spaces">
                                   Pre-Leased Spaces
                                 </option>
                                 <option value="Restaurants">Restaurants</option>
                                 <option value="SCO Plots">SCO Plots</option>
                                 <option value="Business Center">Business Center</option>
                                 <option value="Food Court">Food Court</option>
                                 <option value="Multiplex">Multiplex</option>
                                 <option value="Co-working">Co-working</option>
                               </select>
                             </div>
                           )}
                        {(
           (buildingType === "Commercial" &&
             [
               "Office",
               "Retail",
               "Storage",
               "Industry",
               "Hospitality",
               "Other",
             ].includes(propertyType)) ||
         
           (buildingType === "Residential" &&
             propertyType === "Other")
         ) && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Purchase Type
                               </label>
         
                               <select
                                 name="purchase_type"
                                 value={formData.purchase_type || ""}
                                 onChange={handleInputChange}
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Purchase Type</option>
                                 <option value="Resale">Resale</option>
                                 <option value="New Bookings">New Bookings</option>
                               </select>
                             </div>
                           )}
                         {buildingType === "Commercial" &&
                           ["Office Space"].includes(propertyType) && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Personal Washroom
                               </label>
         
                               <select
                                 name="personal_washroom"
                                 value={formData.personal_washroom || ""}
                                 onChange={handleInputChange}
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select</option>
                                 <option value="Yes">Yes</option>
                                 <option value="No">No</option>
                               </select>
                             </div>
                           )}
                         {buildingType === "Commercial" && propertyType === "Office" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Number of Seats Available
                             </label>
         
                             <input
                               type="text"
                               value={formData.number_of_seats_available || ""}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 if (/^\d*$/.test(value)) {
                                   setFormData((prev) => ({
                                     ...prev,
                                     number_of_seats_available: value,
                                   }));
                                 }
                               }}
                               placeholder="Enter number of seats"
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             />
                           </div>
                         )}
                         {buildingType === "Residential" && propertyType === "PG" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Available For{" "}
                               <span className="text-xl font-bold text-red-500">*</span>
                             </label>
         
                             <select
                               value={formData.available_for || ""}
                               onChange={(e) =>
                                 handleInputChange("available_for", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Availability</option>
                               <option value="Girls">Girls</option>
                               <option value="Boys">Boys</option>
                               <option value="Family">Family</option>
                               <option value="Single women">Single women</option>
                               <option value="Single Men">Single Men</option>
                             </select>
         
                             {errors?.available_for && (
                               <p className="flex items-center gap-1 mt-1 text-sm text-red-500">
                                 <MdErrorOutline className="text-lg" />
                                 {errors.available_for}
                               </p>
                             )}
                           </div>
                         )}
                         {buildingType === "Residential" && propertyType === "PG" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Room Type <span className="text-red-500">*</span>
                             </label>
         
                             <select
                               value={formData.room_type || ""}
                               onChange={(e) =>
                                 handleInputChange("room_type", e.target.value)
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Room Type</option>
                               <option value="Private">Private</option>
                               <option value="Sharing">Sharing</option>
                             </select>
         
                             {errors?.room_type && (
                               <p className="text-sm text-red-500 mt-1">
                                 {errors.room_type}
                               </p>
                             )}
                           </div>
                         )}
                         {buildingType === "Residential" &&
                           propertyType === "PG" &&
                           formData.room_type === "Sharing" && (
                             <div>
                               <label className="block mb-1 font-medium text-gray-700">
                                 How many people can share this room?
                               </label>
         
                               <select
                                 value={formData.no_of_peoples || ""}
                                 onChange={(e) =>
                                   handleInputChange("no_of_peoples", e.target.value)
                                 }
                                 className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select</option>
                                 <option value="2">2</option>
                                 <option value="3">3</option>
                                 <option value="4">4</option>
                                 <option value="4+">4+</option>
                               </select>
                             </div>
                           )}
                         {buildingType === "Residential" && propertyType === "PG" && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Total Beds
                             </label>
         
                             <input
                               type="text"
                               value={formData.total_beds || ""}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 if (/^\d*$/.test(value)) {
                                   handleInputChange("total_beds", value);
                                 }
                               }}
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             />
                           </div>
                         )}
                         {buildingType === "Residential" && propertyType === "PG" && (
                           <div>
                             <label className="block mb-1 font-medium text-gray-700">
                               Available Beds
                             </label>
         
                             <input
                               type="text"
                               value={formData.available_beds || ""}
                               placeholder="Enter Available Beds"
                               onChange={(e) => {
                                 const value = e.target.value;
         
                                 if (/^\d*$/.test(value)) {
                                   handleInputChange("available_beds", value);
                                 }
                               }}
                               className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             />
                           </div>
                         )}
                         {buildingType === "Residential" && propertyType === "PG" && (
                           <div className="md:col-span-3 mt-4">
                             <div className="flex flex-wrap gap-4">
                               {/* Attached Balcony */}
                               <label className="flex items-center gap-2">
                                 <input
                                   type="checkbox"
                                   checked={formData.attached_balcony === "Yes"}
                                   onChange={(e) =>
                                     handleInputChange(
                                       "attached_balcony",
                                       e.target.checked ? "Yes" : "No",
                                     )
                                   }
                                 />
                                 Attached Balcony
                               </label>
         
                               {/* Attached Bathroom */}
                               <label className="flex items-center gap-2">
                                 <input
                                   type="checkbox"
                                   checked={formData.attached_bathroom === "Yes"}
                                   onChange={(e) =>
                                     handleInputChange(
                                       "attached_bathroom",
                                       e.target.checked ? "Yes" : "No",
                                     )
                                   }
                                 />
                                 Attached Bathroom
                               </label>
                             </div>
                           </div>
                         )}
                         {!(
                           (buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             [
                               "Land",
                               "Plot/Land",
                               "Industry",
                               "Storage",
                               "Hospitality",
                               "Retail",
                             ].includes(propertyType))
                         ) && (
                           <div>
                             <label className="font-medium text-gray-700">
                               Parking Availability
                             </label>
         
                             <select
                               value={formData.parking_availability || ""}
                               onChange={(e) =>
                                 handleInputChange(
                                   "parking_availability",
                                   e.target.value,
                                 )
                               }
                               className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                             >
                               <option value="">Select Option</option>
                               <option value="Yes">Yes</option>
                               <option value="No">No</option>
                             </select>
                           </div>
                         )}
                         {!(
                           (buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             [
                               "Land",
                               "Plot/Land",
                               "Industry",
                               "Storage",
                               "Hospitality",
                             ].includes(propertyType))
                         ) &&
                           formData.parking_availability === "Yes" && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Covered Parking
                               </label>
         
                               <select
                                 value={formData.covered_parking || ""}
                                 onChange={(e) =>
                                   handleInputChange("covered_parking", e.target.value)
                                 }
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Covered Parking</option>
                                 <option value="1">1</option>
                                 <option value="2">2</option>
                                 <option value="3">3</option>
                                 <option value="4">4</option>
                                 <option value="5">5</option>
                                 <option value="6">6</option>
                                 <option value="6+">6+</option>
                                 <option value="NA">NA</option>
                               </select>
                             </div>
                           )}
                         {!(
                           (buildingType === "Residential" && propertyType === "Plot") ||
                           (buildingType === "Commercial" &&
                             [
                               "Land",
                               "Plot/Land",
                               "Industry",
                               "Storage",
                               "Hospitality",
                             ].includes(propertyType))
                         ) &&
                           formData.parking_availability === "Yes" && (
                             <div>
                               <label className="font-medium text-gray-700">
                                 Uncovered Parking
                               </label>
         
                               <select
                                 value={formData.uncovered_parking || ""}
                                 onChange={(e) =>
                                   handleInputChange("uncovered_parking", e.target.value)
                                 }
                                 className="w-full p-3 mt-1 border rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                               >
                                 <option value="">Select Uncovered Parking</option>
                                 <option value="1">1</option>
                                 <option value="2">2</option>
                                 <option value="3">3</option>
                                 <option value="4">4</option>
                                 <option value="5">5</option>
                                 <option value="6">6</option>
                                 <option value="6+">6+</option>
                                 <option value="NA">NA</option>
                               </select>
                             </div>
                           )}
                       </div>
         
                       <div className="p-3 mx-auto mb-16 bg-white border max-w-7xl rounded-xl">
                         {/* Header Section */}
                         <div className="mb-6">
                           <h2 className="text-2xl font-semibold text-gray-900">
                             Project Info
                           </h2>
                           <p className="text-gray-500">
                             Details about the project, including an overview and
                             description that provides insight into the project's
                             purpose, goals, and unique aspects.
                           </p>
                         </div>
         
                         {/* Form Grid */}
                         <div className="grid grid-cols-1 sm:grid-cols-[2.9fr_1fr]">
                           {/* About Project  */}
                           <div>
                             <label className="block mb-2 font-medium text-gray-700">
                               About Project
                             </label>
                             <div className="flex justify-end mb-2">
                               <button
                                 type="button"
                                 onClick={generateDescription}
                                 disabled={isGeneratingDescription}
                                 className="px-4 py-2 text-white rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-50"
                               >
                                 {isGeneratingDescription
                                   ? "Generating..."
                                   : "Generate Description"}
                               </button>
                             </div>
                             <textarea
                               type="text"
                               value={description}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 setDescription(value);
                               }}
                               className="w-full h-40 p-3 text-gray-700 border rounded-md outline-none focus:ring-2 focus:ring-rose-500"
                             />
                           </div>
                         </div>
                       </div>
                     </>
                   )}


                        {activeStep === 3 && (
                            <>
                                <div className="max-w-5xl mx-auto bg-white rounded-xl">
                                    {/* Title & Subtitle */}
                                    <div>
                                        <h2 className="text-2xl text-gray-900">Amenities</h2>
                                        <p className="mt-1 text-gray-500">
                                            This section allows users to select available amenities for
                                            the project, with dynamically updated checkboxes to
                                            represent selected features.
                                        </p>
                                    </div>

                                    {/* Amenities List */}
                                    <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
                                        {amenitiesList.map((amenity, index) => (
                                            <label
                                                key={index}
                                                className="flex items-center space-x-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAmenities.includes(amenity._id)} // Check if this amenity is selected
                                                    onChange={() => toggleAmenity(amenity._id)} // Trigger toggle on change
                                                    className="w-5 h-5 text-purple-600 border-gray-300 form-checkbox focus:ring-purple-500"
                                                />
                                                <span
                                                    className={`text-gray-700 ${selectedAmenities.includes(amenity._id)
                                                        ? "text-purple-600 font-medium"
                                                        : ""
                                                        }`}
                                                >
                                                    {amenity.amenity_name}{" "}
                                                    {/* Display the name of the amenity */}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeStep === 4 && (
                            <>
                                <div className="max-w-5xl p-6 pt-0 mx-auto">
                                    {/* Logo Upload Section */}
                                    <div
                                        className="p-6 mb-6 bg-white border border-gray-200 rounded-xl"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file) handleLogoFile(file);
                                        }}
                                    >
                                        <h2 className="text-xl text-gray-900">Upload Project Logo</h2>
                                        <p className="mt-1 text-gray-500">Upload your brand or project logo here.</p>

                                        <div className="relative flex flex-col items-center p-6 mt-4 border-2 border-gray-300 border-dashed rounded-lg">
                                            {logo ? (
                                                <div className="relative flex flex-col items-center w-full">
                                                    <img
                                                        src={
                                                            typeof logo === "string"
                                                                ? logo
                                                                : logo instanceof File
                                                                    ? URL.createObjectURL(logo)
                                                                    : ""
                                                        }
                                                        alt="Logo Preview"
                                                        className="object-contain mb-2 rounded-md w-28 h-28"
                                                    />
                                                    <button
                                                        onClick={handleLogoDelete}
                                                        className="absolute p-1 bg-black bg-opacity-50 rounded-full top-2 right-2"
                                                    >
                                                        <Trash className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <MdOutlineDriveFolderUpload className="text-gray-400 text-8xl" />
                                                    <p className="mt-2 text-gray-500">Drag and Drop Logo or Upload</p>
                                                    <button
                                                        onClick={() => logoInputRef.current.click()}
                                                        className="px-4 py-2 mt-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                                    >
                                                        + Upload Logo
                                                    </button>
                                                    <p className="mt-2 text-xs text-center text-gray-400">
                                                        Accepted formats: .jpg, .png, .svg | Max size: 5MB
                                                    </p>
                                                </>
                                            )}

                                            {/* Hidden input used only by custom button */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={logoInputRef}
                                                style={{ display: "none" }}
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        handleLogoFile(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </div>

                                    </div>
                                    {/* Grid Layout */}
                                    <div className="grid grid-cols-1 gap-6 mb-4 md:grid-cols-2">
                                        {/* Upload Property Cover Photo */}
                                        <div className="p-6 bg-white border-gray-200 rounded-xl border-1">
                                            <h2 className="text-xl text-gray-900">
                                                Upload property cover photo
                                            </h2>
                                            <p className="mt-1 text-gray-500">
                                                This step allows users to upload cover photo.
                                            </p>
                                            <div className="relative flex flex-col items-center p-6 mt-4 border-2 border-gray-300 border-dashed rounded-lg">
                                                {coverImage || coverImageFromAPI ? (
                                                    <div className="relative w-full">
                                                        {/* Uploaded Image */}
                                                        <img
                                                            src={
                                                                coverImage
                                                                    ? URL.createObjectURL(coverImage)
                                                                    : coverImageFromAPI
                                                            }
                                                            alt="Uploaded Preview"
                                                            className="object-cover w-full h-64 rounded-md"
                                                        />
                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={handelCoverImageDelete}
                                                            className="absolute p-1 bg-black bg-opacity-50 rounded-full top-2 right-2"
                                                        >
                                                            <Trash className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Upload Section (only visible when no image) */}
                                                        <div className="text-gray-400 text-8xl">
                                                            <MdOutlineDriveFolderUpload />
                                                        </div>

                                                        <p className="mt-2 text-gray-500">
                                                            Drag and Drop Imag or Upload
                                                        </p>

                                                        <button
                                                            onClick={() => imageInputRef.current.click()}
                                                            className="px-4 py-2 mt-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                                        >
                                                            + Add Photo
                                                        </button>

                                                        <p className="mt-2 text-xs text-center text-gray-400">
                                                            Property listing with more than 5 images get 3x more
                                                            views.
                                                            <br />
                                                            Accepted formats: .jpg, .gif, .bmp, .png | Max size:
                                                            50MB
                                                        </p>
                                                    </>
                                                )}

                                                {/* Hidden Input (always present) */}
                                                <input
                                                    type="file"
                                                    name="cover_image"
                                                    accept="image/*"
                                                    ref={imageInputRef}
                                                    onChange={(e) => setCoverImage(e.target.files[0])}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>

                                        {/* Upload Video Section */}
                                        <div className="flex flex-col gap-6 ">
                                            {/* Upload Video */}
                                            <div className="p-6 bg-white border-gray-200 rounded-xl border-1">
                                                <h2 className="text-xl text-gray-900">Upload Video</h2>
                                                <p className="mt-1 text-gray-500">
                                                    This step allows users to upload videos.
                                                </p>
                                                {video || videoFromAPI ? (
                                                    <div className="relative">
                                                        <video
                                                            controls
                                                            src={
                                                                video ? URL.createObjectURL(video) : videoFromAPI
                                                            }
                                                            className="object-cover w-full rounded-lg h-72"
                                                        />
                                                        <button
                                                            onClick={handleVideoDelete}
                                                            className="absolute p-1 bg-black bg-opacity-50 rounded-full top-2 right-2"
                                                        >
                                                            <Trash className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => videoInputRef.current.click()}
                                                        className="px-4 py-2 mt-4 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                                    >
                                                        Upload Video
                                                    </button>
                                                )}

                                                <input
                                                    ref={videoInputRef}
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={handleVideoUpload}
                                                    className="hidden"
                                                />
                                            </div>

                                            {/* OR Divider */}
                                            <div className="flex items-center justify-center">
                                                <div className="w-full border-t border-gray-300"></div>
                                                <span className="px-4 text-lg font-bold text-gray-700">
                                                    OR
                                                </span>
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>

                                            {/* Video Option */}
                                            <div className="p-6 bg-white border-gray-200 rounded-xl border-1">
                                                <h2 className="text-xl text-gray-900">Video Option</h2>
                                                <p className="mt-1 text-gray-500">
                                                    This step allows users to upload video UR.
                                                </p>
                                                <div className="flex gap-4 mt-4">
                                                    <div className="w-1/2">
                                                        <label className="block mb-2 text-gray-700">
                                                            Select Video Source
                                                        </label>
                                                        <select
                                                            value={videoSource}
                                                            onChange={(e) => setVideoSource(e.target.value)}
                                                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        >
                                                            <option value="">Select Video Source</option>
                                                            <option value="YouTube">YouTube</option>
                                                            <option value="Vimeo">Vimeo</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>

                                                    <div className="w-1/2">
                                                        <label className="block mb-2 text-gray-700">
                                                            Enter Video URL
                                                        </label>
                                                        <input
                                                            type="text"
                                                            // placeholder="Enter Video URL"
                                                            value={formData.video_url}
                                                            onChange={(e) => {
                                                                handleInputChange(e);
                                                                setIsModified(true);
                                                            }}
                                                            name="video_url"
                                                            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Upload Property Cover Photo */}
                                        <div className="p-6 bg-white border-gray-200 rounded-xl border-1">
                                            {/* Header */}
                                            <h2 className="text-xl text-gray-900">Upload photos of your property</h2>
                                            <p className="mt-1 text-gray-500">
                                                This step allows users to uploading additional images.
                                            </p>

                                            {/* Drag & Drop Area */}
                                            <div className="flex flex-col items-center p-8 mt-4 border-2 border-gray-300 border-dashed rounded-lg">
                                                <div className="text-gray-400 text-8xl">
                                                    <MdOutlineDriveFolderUpload />
                                                </div>
                                                <p className="mt-2 text-gray-700">
                                                    Drag and Drop Image Or Uploaded.
                                                </p>
                                                <button
                                                    onClick={() => imageInputRef2.current.click()}
                                                    className="px-4 py-2 mt-3 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                                >
                                                    + Add Photos
                                                </button>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    ref={imageInputRef2}
                                                    onChange={handleImageUpload2}
                                                    className="hidden"
                                                />
                                                <p className="mt-2 text-xs text-center text-gray-400">
                                                    Property listing with more than 5 images gets 3x more views.
                                                    <br />
                                                    Accepted formats: .jpg, .gif, .bmp, .png | Max size: 50MB
                                                </p>
                                                <p className="mt-2 text-sm text-gray-500">
                                                    Total images: {imagesFromAPI.length + fileData.length}
                                                </p>
                                            </div>

                                            {/* Uploaded Images Grid */}
                                            <div className="grid grid-cols-4 gap-3 mt-6">
                                                {/* Existing images from API */}
                                                {imagesFromAPI?.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={image.image}
                                                            alt="Uploaded Property"
                                                            className="object-cover w-full h-24 rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => handleDelete(index)}
                                                            className="absolute p-1 bg-black bg-opacity-50 rounded-md top-1 right-1"
                                                        >
                                                            <Trash className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Preview newly selected images */}
                                                {fileData?.map((file, index) => (
                                                    <div key={`new-${index}`} className="relative">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt="New Upload"
                                                            className="object-cover w-full h-24 rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveNewImage(index)}
                                                            className="absolute p-1 bg-black bg-opacity-50 rounded-md top-1 right-1"
                                                        >
                                                            <Trash className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>


                                        {/* Virtual Tour Section */}
                                        <div className="flex flex-col gap-6">
                                            <div className="p-6 bg-white border-gray-200 rounded-xl border-1">
                                                {/* Heading */}
                                                <h2 className="text-xl font-semibold text-gray-900">
                                                    Virtual Tour
                                                </h2>
                                                <p className="mt-1 text-gray-500">
                                                    This step allows users to indicate if a virtual tour is
                                                    available for the property.
                                                </p>

                                                {/* Label */}
                                                <label className="block mt-4 font-medium text-gray-700">
                                                    Is Virtual Tour Available?
                                                </label>

                                                {/* Dropdown for Yes/No */}
                                                <select
                                                    name="virtual_tour_availability"
                                                    value={formData.virtual_tour_availability}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="Yes">Yes</option>
                                                    <option value="No">No</option>
                                                </select>
                                            </div>

                                            {/* --- Inserted Brochure Upload Section Here --- */}
                                            <div className="p-6 bg-white border border-gray-200 rounded-xl">
                                                <h2 className="text-xl text-gray-900">Upload brochure (PDF/Image)</h2>
                                                <p className="mt-1 text-gray-500">This step allows users to upload brochures.</p>

                                                <div className="relative flex flex-col items-center w-full p-6 mt-4 border-2 border-gray-300 border-dashed rounded-lg">
                                                    {/* Uploaded Preview (PDF or Image) */}
                                                    {(brochureDoc || brochureDocFromAPI) && (
                                                        <div className="relative flex flex-col items-center w-full mb-4">
                                                            <button
                                                                onClick={handleBrochureDelete}
                                                                className="absolute top-0 right-0 z-10 flex items-center justify-center w-6 h-6 text-white bg-black bg-opacity-50 rounded-full"
                                                                title="Delete Brochure"
                                                            >
                                                                <Trash className="w-4 h-4 text-white" />
                                                            </button>
                                                            {(brochureDoc?.type === "application/pdf" || brochureDocFromAPI?.endsWith(".pdf")) ? (
                                                                <div className="flex items-center justify-between w-full px-2 py-2 rounded-md bg-gray-50">
                                                                    <FaFilePdf className="text-lg text-red-600" />
                                                                    <span className="text-sm text-gray-600 font-medium flex items-center gap-1 break-words truncate w-[85%]">
                                                                        {brochureDoc?.name || brochureDocFromAPI?.split("/").pop() || "Brochure.pdf"}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="relative w-full">
                                                                    <img
                                                                        src={brochureDoc ? URL.createObjectURL(brochureDoc) : brochureDocFromAPI}
                                                                        alt="Brochure Preview"
                                                                        className="object-cover w-full h-64 rounded-md"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Always-visible Upload Button */}
                                                    <button
                                                        onClick={() => brochureInputRef.current.click()}
                                                        className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                                                    >
                                                        + Upload Brochure
                                                    </button>

                                                    <p className="mt-2 text-xs text-center text-gray-400">
                                                        Accepted formats: .jpg, .png, .jpeg, .pdf | Max size: 50MB
                                                    </p>

                                                    {/* Hidden Input */}
                                                    <input
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        ref={brochureInputRef}
                                                        onChange={handleBrochureUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigation Buttons - Fixed at Bottom */}
                        <div
                            className={`fixed bottom-0 left-40 right-0 bg-white p-4 shadow-md flex mx-32 ${activeStep === 0 ? "justify-end" : "justify-between"
                                }`}
                        >            {activeStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="px-5 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Back
                            </button>
                        )}
                            {activeStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-5 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                >
                                    Continue
                                </button>
                            ) : (
                                // isModified && (
                                <button
                                    onClick={handleEditProject}
                                    disabled={isSubmitting}
                                    className={`mt-4 px-4 py-2 rounded ${isSubmitting ? "bg-gray-400" : "bg-green-600 hover:bg-purple-700"} text-white`}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit"}
                                </button>
                                // )
                            )}
                        </div>
                    </div>
                </div >
            </div>
        </>
    );
};
export default UpdateProject;
