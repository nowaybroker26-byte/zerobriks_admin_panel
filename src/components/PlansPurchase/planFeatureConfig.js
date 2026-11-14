// Configuration for Role-based Plan Features, Enums, and Limits

export const USER_ROLES = [
  { id: "Buyer", label: "Buyer / Tenant", emoji: "🎯" },
  { id: "Owner", label: "Property Owner", emoji: "🏠" },
  { id: "Builder", label: "Builder / Developer", emoji: "🏗️" },
];

export const normalizeRoleKey = (rawRole) => {
  if (!rawRole) return "Buyer";
  const str = String(rawRole).toLowerCase();
  if (str.includes("builder") || str.includes("developer") || str.includes("project")) {
    return "Builder";
  }
  if (str.includes("owner") || str.includes("landlord")) {
    return "Owner";
  }
  return "Buyer";
};

// Features definition with Enums, Numbers and Options for each User Type
export const ROLE_FEATURES = {
  Buyer: [
    {
      key: "contact_unlocks",
      title: "Owner Contact Unlocks (Shared Limit)",
      type: "number",
      unit: "Contacts",
      defaultValue: "15",
      desc: "Number of genuine property owner contacts buyer can unlock",
    },
    {
      key: "residential_commercial_pg_search",
      title: "Residential / Commercial / PG Search",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Full access to residential flats, commercial properties, and PG rooms search",
    },
    {
      key: "buy_rent_property_search",
      title: "Buy / Rent Property Search",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Search properties available for both buying and renting",
    },
    {
      key: "property_photos_details",
      title: "Property Photos & Details",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "View verified HD photos, amenities & property specifications",
    },
    {
      key: "project_photos_details",
      title: "Project Photos & Details",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "View verified project photos, master plans, tower units & specifications",
    },
    {
      key: "save_favorite_properties",
      title: "Save Favorite Properties",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Shortlist favorite properties and access anytime",
    },
    {
      key: "advanced_search_filters",
      title: "Advanced Search Filters (Map Based)",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Interactive map radius search and multi-amenity filtering",
    },
    {
      key: "new_property_alerts",
      title: "New Property Alerts",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Alert notifications when matching properties are posted (Push, Email, WhatsApp)",
    },
    {
      key: "shortlisted_property_comparison",
      title: "Shortlisted Property Comparison",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Side-by-side comparison of shortlisted properties with AI summary analysis",
    },
    {
      key: "dedicated_support",
      title: "Dedicated Support",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Manual dedicated support team assistance for property search inquiries",
    },
    {
      key: "personalized_property_assistance",
      title: "Personalized Property Assistance",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Manual personalized property assistance and concierge service",
    },
  ],

  Owner: [
    {
      key: "no_of_property_units",
      title: "Active Listings / Post Property (Shared Limit)",
      type: "number",
      unit: "Listings",
      defaultValue: "1",
      desc: "Max properties owner can have live concurrently on app and web",
    },
    {
      key: "residential_property_listing",
      title: "Residential Property Listing",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Allows posting residential flats, villas, builder floors for sale/rent",
    },
    {
      key: "commercial_property_listing",
      title: "Commercial Property Listing",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Allows posting commercial shops, offices, warehouses, plots",
    },
    {
      key: "pg_property_listing",
      title: "PG Property Listing",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Allows posting PG rooms, student hostels & coliving spaces",
    },
    {
      key: "property_photos_details",
      title: "Property Photos & Details",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "View verified HD photos, floor plans & property details",
    },
    {
      key: "project_photos_details",
      title: "Project Photos & Details",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "View verified project photos, master plans, tower units & specifications",
    },
    {
      key: "buyer_tenant_enquiries",
      title: "Buyer / Tenant Enquiries",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Receive and view verified direct leads and enquiries in real-time",
    },
    {
      key: "edit_property_details",
      title: "Edit Property Details",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Modify property details, pause & reactivate anytime without extra cost",
    },
    {
      key: "listing_performance_dashboard",
      title: "Listing Performance Dashboard",
      type: "select",
      options: ["Basic", "Advance", "No"],
      defaultValue: "Basic",
      desc: "Graphical analytics of views, saves, timestamps, and seeker demographics",
    },
    {
      key: "featured_credits",
      title: "Featured Listing Credits",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Option to mark posted property as Featured with priority badge (Yes / No)",
    },
    {
      key: "advertising_credits",
      title: "Advertising (Hero Slider) Credits",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Manual admin contact for hero banner advertising (Yes / No)",
    },
  ],

  Builder: [
    {
      key: "no_of_project_units",
      title: "Maximum Projects",
      type: "number",
      unit: "Projects",
      defaultValue: "1",
      desc: "Total projects builder can showcase and post under this plan",
    },
    {
      key: "no_of_property_units",
      title: "Active Listings / Post Property (Shared Limit)",
      type: "number",
      unit: "Listings",
      defaultValue: "1",
      desc: "Active property listings limit under builder account",
    },
    {
      key: "residential_development_project",
      title: "Residential Development Project",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Post and showcase residential development projects, townships & villas",
    },
    {
      key: "commercial_development_project",
      title: "Commercial Development Project",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Post and showcase commercial development projects, IT parks & malls",
    },
    {
      key: "residential_property_listing",
      title: "Residential Property Listing",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Post residential category property listings (flats, apartments, villas)",
    },
    {
      key: "commercial_property_listing",
      title: "Commercial Property Listing",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Post commercial category property listings (offices, shops, showrooms)",
    },
    {
      key: "pg_property_listing",
      title: "PG Property Listing",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Post PG accommodation & co-living property listings",
    },
    {
      key: "sale_property_listing",
      title: "Individual Resale Listings",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Post individual resale property listings (Sell category)",
    },
    {
      key: "edit_existing_project",
      title: "Edit Project Details",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "Yes",
      desc: "Update and edit existing project details, towers, configurations and stages",
    },
    {
      key: "listing_performance_dashboard",
      title: "Listing Performance Dashboard",
      type: "select",
      options: ["Basic", "Advance", "No"],
      defaultValue: "Basic",
      desc: "Profile tab graphical analytics dashboard for views, saves, timings and area demographics",
    },
    {
      key: "featured_credits",
      title: "Featured Listing Credits",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Option to mark posted property as Featured with priority visibility (Yes / No)",
    },
    {
      key: "advertising_credits",
      title: "Advertising (Hero Slider) Credits",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Manual admin contact for hero banner advertising (Yes / No)",
    },
    {
      key: "top_developer",
      title: "Top Developer Slots",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Mark as Top Developer when posting project (Yes / No)",
    },
    {
      key: "upcoming_project",
      title: "Upcoming Projects Slots",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Mark as Upcoming Project when posting project (Yes / No)",
    },
    {
      key: "dedicated_support",
      title: "Dedicated Support",
      type: "boolean",
      options: ["Yes", "No"],
      defaultValue: "No",
      desc: "Manual operations and relationship manager support from admin team",
    },
  ],
};

// Compute GST 18% breakdown
export const calculateGstBreakdown = (basePrice, gstRate = 18) => {
  const price = parseFloat(basePrice) || 0;
  if (price <= 0) {
    return {
      price: "0.00",
      gstAmount: "0.00",
      totalPayable: "0.00",
    };
  }
  const gstAmount = price * (gstRate / 100);
  const totalPayable = price + gstAmount;
  return {
    price: price.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    totalPayable: totalPayable.toFixed(2),
  };
};
