export const SERVICE_TYPES = [
  { id: 'tailoring', label: 'Tailoring' },
  { id: 'salon', label: 'Salon & Barbing' },
  { id: 'laundry', label: 'Laundry & Dry Cleaning' },
  { id: 'mechanic', label: 'Auto Repair / Mechanic' },
  { id: 'phone_repair', label: 'Phone Repair' },
  { id: 'electronics_repair', label: 'Electronics Repair' },
  { id: 'catering', label: 'Catering & Food Services' },
  { id: 'event_planning', label: 'Event Planning & Decor' },
  { id: 'photography', label: 'Photography & Videography' },
  { id: 'cleaning', label: 'Cleaning Services' },
  { id: 'cyber_cafe', label: 'Cyber Café / Business Center' },
  { id: 'printing', label: 'Printing & Photocopy' },
  { id: 'delivery', label: 'Delivery & Logistics' },
  { id: 'gym', label: 'Gym & Fitness' },
  { id: 'tutoring', label: 'Tutoring & Lesson Center' },
  { id: 'real_estate', label: 'Real Estate Agency' },
  { id: 'plumbing', label: 'Plumbing Services' },
  { id: 'electrical', label: 'Electrical Services' },
  { id: 'carpentry', label: 'Carpentry / Woodwork' },
  { id: 'painting', label: 'Painting Services' },
  { id: 'welding', label: 'Welding / Metalwork' },
  { id: 'generator_repair', label: 'Generator Repair' },
  { id: 'ac_repair', label: 'AC / Refrigerator Repair' },
  { id: 'car_wash', label: 'Car Wash & Detailing' },
  { id: 'security', label: 'Security Services' },
  { id: 'pest_control', label: 'Pest Control' },
  { id: 'other_service', label: 'Other Service' },
];

export const SERVICE_TYPE_IDS = SERVICE_TYPES.map((s) => s.id);

// Measurement/detail field templates — shown as suggestions, user can add/remove
export const SERVICE_FIELD_TEMPLATES = {
  tailoring: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Length', 'Garment Type'],
  salon: ['Service', 'Duration', 'Stylist Notes'],
  laundry: ['Item Type', 'Item Count', 'Special Instructions'],
  mechanic: ['Vehicle Type', 'Registration Number', 'Issue Description', 'Parts Needed'],
  phone_repair: ['Phone Model', 'IMEI', 'Issue Description', 'Parts Needed'],
  electronics_repair: ['Device Type', 'Model', 'Issue Description', 'Parts Needed'],
  catering: ['Event Type', 'Guest Count', 'Menu Items', 'Delivery Location'],
  event_planning: ['Event Type', 'Guest Count', 'Venue', 'Date & Time'],
  photography: ['Shoot Type', 'Location', 'Duration', 'Deliverables'],
  cleaning: ['Property Type', 'Rooms', 'Special Requests'],
  cyber_cafe: ['Service Type', 'Duration', 'Computer Number'],
  printing: ['Document Type', 'Pages', 'Copies', 'Color/B&W'],
  delivery: ['Pickup Location', 'Drop-off Location', 'Package Type', 'Weight'],
  gym: ['Membership Type', 'Duration', 'Personal Trainer'],
  tutoring: ['Subject', 'Student Level', 'Duration', 'Mode'],
  real_estate: ['Property Type', 'Location', 'Price Range', 'Client Budget'],
  plumbing: ['Issue Type', 'Location', 'Materials Needed', 'Urgency'],
  electrical: ['Issue Type', 'Location', 'Materials Needed', 'Urgency'],
  carpentry: ['Project Type', 'Materials', 'Dimensions', 'Finish'],
  painting: ['Project Type', 'Area Size', 'Paint Type', 'Rooms'],
  welding: ['Project Type', 'Materials', 'Dimensions', 'Finish'],
  generator_repair: ['Generator Type', 'Issue Description', 'Parts Needed', 'Urgency'],
  ac_repair: ['AC Type', 'Issue Description', 'Parts Needed', 'Urgency'],
  car_wash: ['Vehicle Type', 'Service Package', 'Extras'],
  security: ['Service Type', 'Duration', 'Personnel Count', 'Location'],
  pest_control: ['Pest Type', 'Property Size', 'Treatment Type', 'Rooms'],
  other_service: [],
};

// Status stages — different vocabulary per service so it reads like software built for that trade
export const SERVICE_STATUS_STAGES = {
  tailoring: ['Cutting', 'Stitching', 'Fitting', 'Ready', 'Delivered'],
  salon: ['Booked', 'In Progress', 'Completed', 'Cancelled', 'No-show'],
  laundry: ['Received', 'Washing', 'Drying', 'Ready', 'Delivered'],
  mechanic: ['Diagnosis', 'Parts Ordered', 'Repair', 'Testing', 'Ready'],
  phone_repair: ['Received', 'Diagnosis', 'Repair', 'Testing', 'Ready'],
  electronics_repair: ['Received', 'Diagnosis', 'Repair', 'Testing', 'Ready'],
  catering: ['Enquiry', 'Confirmed', 'Preparation', 'Delivery', 'Completed'],
  event_planning: ['Enquiry', 'Planning', 'Setup', 'Execution', 'Completed'],
  photography: ['Booking', 'Shoot', 'Editing', 'Delivery', 'Completed'],
  cleaning: ['Booking', 'Confirmed', 'In Progress', 'Inspection', 'Completed'],
  cyber_cafe: ['Active', 'Completed', 'Cancelled'],
  printing: ['Received', 'In Progress', 'Ready', 'Delivered'],
  delivery: ['Pickup', 'In Transit', 'Out for Delivery', 'Delivered'],
  gym: ['Enquiry', 'Registered', 'Active', 'Expired'],
  tutoring: ['Enquiry', 'Registered', 'Active', 'Completed'],
  real_estate: ['Enquiry', 'Viewing', 'Negotiation', 'Closed'],
  plumbing: ['Enquiry', 'Inspection', 'Quote Sent', 'In Progress', 'Completed'],
  electrical: ['Enquiry', 'Inspection', 'Quote Sent', 'In Progress', 'Completed'],
  carpentry: ['Enquiry', 'Measurement', 'Quote Sent', 'In Progress', 'Completed'],
  painting: ['Enquiry', 'Inspection', 'Quote Sent', 'In Progress', 'Completed'],
  welding: ['Enquiry', 'Design', 'Quote Sent', 'In Progress', 'Completed'],
  generator_repair: ['Received', 'Diagnosis', 'Quote Sent', 'Repair', 'Ready'],
  ac_repair: ['Received', 'Diagnosis', 'Quote Sent', 'Repair', 'Ready'],
  car_wash: ['Queued', 'Washing', 'Detailing', 'Ready'],
  security: ['Enquiry', 'Assessment', 'Deployed', 'Completed'],
  pest_control: ['Booking', 'Inspection', 'Treatment', 'Follow-up', 'Completed'],
  other_service: ['Pending', 'In Progress', 'Ready', 'Delivered'],
};

export const isServiceType = (type) => SERVICE_TYPE_IDS.includes(type);

export const getServiceLabel = (business) => {
  if (!business) return 'Service';
  if (business.type === 'other_service') return business.serviceLabel || 'Service';
  const match = SERVICE_TYPES.find((s) => s.id === business.type);
  return match?.label || 'Service';
};

export const getServiceStages = (type) => {
  return SERVICE_STATUS_STAGES[type] || SERVICE_STATUS_STAGES.other_service;
};

export const getServiceFields = (type) => {
  return SERVICE_FIELD_TEMPLATES[type] || [];
};