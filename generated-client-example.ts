import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

type BusinessClientResource = {
  id: number;
  business_id: number;
  user_id: number;
  status: string;
  notes: string | null;
  first_appointment_date: string | null;
  last_appointment_date: string | null;
  total_appointments: number;
  total_spent: string;
  created_at: string | null;
  updated_at: string | null;
  user?: UserResource | undefined;
  business?: BusinessResource | undefined;
};
type WorkingHourResource = {
  day_of_week: string;
  opening_time: string | null;
  closing_time: string | null;
  is_closed: boolean;
};
type BusinessEmployeeResource = {
  id: number;
  user_id: number;
  rating: string | null;
  status: string;
  user?: UserResource | undefined;
  services?: Array<ServiceResource> | undefined;
};
type BusinessResource = {
  id: number;
  business_name: string;
  business_type_id: number | null;
  business_type: string;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  image: string | null;
  rating: string | null;
  status: string | null;
  opening_hours: string | null;
  closing_hours: string | null;
  location: string | null;
  lat: string | null;
  lng: string | null;
  owner_id: number;
  is_favorited: string;
  number_of_reviews: number;
  working_hours?: Array<WorkingHourResource> | undefined;
  categories?: Array<ServiceCategoryResource> | undefined;
  employees?: Array<BusinessEmployeeResource> | undefined;
  reviews?: Array<ReviewResource> | undefined;
  services?: Array<ServiceResource> | undefined;
};
type ReviewResource = {
  id: number;
  user_id: number;
  business_id: number;
  appointment_id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  updated_at: string | null;
  user?: UserResource | undefined;
  business?: BusinessResource | undefined;
};
type ServiceCategoryResource = {
  id: number;
  name: string;
  business_id: number;
  services?: Array<ServiceResource> | undefined;
  business?: BusinessResource | undefined;
};
type ServiceResource = {
  id: number;
  name: string;
  price: number;
  duration: number;
  cleaning_time_minutes: number;
  mandatory_cleaning_time: boolean;
  employees?: Array<BusinessEmployeeResource> | undefined;
  category?: ServiceCategoryResource | undefined;
};
type UserResource = {
  id: number;
  name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  email_verified_at: string | null;
  image: string | null;
  role: string;
  roles: Array<unknown>;
  is_verified: string;
  created_at: string | null;
  updated_at: string | null;
  businesses?: Array<BusinessResource> | undefined;
  reviews?: Array<ReviewResource> | undefined;
  employees?: Array<BusinessEmployeeResource> | undefined;
  businessClients?: Array<BusinessClientResource> | undefined;
};

const User = z
  .object({
    id: z.number().int(),
    selected_business_id: z.union([z.number().int(), z.null()]),
    name: z.string(),
    last_name: z.union([z.string(), z.null()]),
    email: z.string(),
    phone_number: z.union([z.string(), z.null()]),
    image: z.union([z.string(), z.null()]),
    email_verified_at: z.union([
      z.string().datetime({ offset: true }),
      z.null(),
    ]),
    google_id: z.union([z.string(), z.null()]),
    role: z.string(),
    is_verified: z.string(),
  })
  .passthrough();
const AppointmentStatus = z.enum([
  "canceled",
  "confirmed",
  "pending",
  "completed",
]);
const WorkingHourResource = z
  .object({
    day_of_week: z.string(),
    opening_time: z.union([z.string(), z.null()]),
    closing_time: z.union([z.string(), z.null()]),
    is_closed: z.boolean(),
  })
  .passthrough();
const BusinessEmployeeResource: z.ZodType<BusinessEmployeeResource> = z.lazy(
  () =>
    z
      .object({
        id: z.number().int(),
        user_id: z.number().int(),
        rating: z.union([z.string(), z.null()]),
        status: z.string(),
        user: UserResource,
        services: z.array(ServiceResource),
      })
      .passthrough()
);
const ServiceResource: z.ZodType<ServiceResource> = z.lazy(() =>
  z
    .object({
      id: z.number().int(),
      name: z.string(),
      price: z.number(),
      duration: z.number().int(),
      cleaning_time_minutes: z.number().int(),
      mandatory_cleaning_time: z.boolean(),
      employees: z.array(BusinessEmployeeResource),
      category: ServiceCategoryResource,
    })
    .passthrough()
);
const ServiceCategoryResource: z.ZodType<ServiceCategoryResource> = z.lazy(() =>
  z
    .object({
      id: z.number().int(),
      name: z.string(),
      business_id: z.number().int(),
      services: z.array(ServiceResource),
      business: BusinessResource,
    })
    .passthrough()
);
const ReviewResource: z.ZodType<ReviewResource> = z.lazy(() =>
  z
    .object({
      id: z.number().int(),
      user_id: z.number().int(),
      business_id: z.number().int(),
      appointment_id: z.number().int(),
      rating: z.number(),
      comment: z.union([z.string(), z.null()]),
      created_at: z.union([z.string().datetime({ offset: true }), z.null()]),
      updated_at: z.union([z.string().datetime({ offset: true }), z.null()]),
      user: UserResource,
      business: BusinessResource,
    })
    .passthrough()
);
const BusinessResource: z.ZodType<BusinessResource> = z.lazy(() =>
  z
    .object({
      id: z.number().int(),
      business_name: z.string(),
      business_type_id: z.union([z.number().int(), z.null()]),
      business_type: z.string(),
      address: z.string().describe("accessor"),
      phone: z.union([z.string(), z.null()]),
      email: z.union([z.string(), z.null()]),
      website: z.union([z.string(), z.null()]),
      description: z.union([z.string(), z.null()]),
      image: z.union([z.string(), z.null()]),
      rating: z.union([z.string(), z.null()]),
      status: z.union([z.string(), z.null()]),
      opening_hours: z.union([z.string(), z.null()]),
      closing_hours: z.union([z.string(), z.null()]),
      location: z.union([z.string(), z.null()]),
      lat: z.union([z.string(), z.null()]),
      lng: z.union([z.string(), z.null()]),
      owner_id: z.number().int(),
      is_favorited: z.string(),
      number_of_reviews: z.number().int().describe("accessor"),
      working_hours: z.array(WorkingHourResource),
      categories: z.array(ServiceCategoryResource),
      employees: z.array(BusinessEmployeeResource),
      reviews: z.array(ReviewResource),
      services: z.array(ServiceResource),
    })
    .passthrough()
);
const BusinessClientResource: z.ZodType<BusinessClientResource> = z.lazy(() =>
  z
    .object({
      id: z.number().int(),
      business_id: z.number().int(),
      user_id: z.number().int(),
      status: z.string(),
      notes: z.union([z.string(), z.null()]),
      first_appointment_date: z.union([
        z.string().datetime({ offset: true }),
        z.null(),
      ]),
      last_appointment_date: z.union([
        z.string().datetime({ offset: true }),
        z.null(),
      ]),
      total_appointments: z.number().int(),
      total_spent: z.string(),
      created_at: z.union([z.string().datetime({ offset: true }), z.null()]),
      updated_at: z.union([z.string().datetime({ offset: true }), z.null()]),
      user: UserResource,
      business: BusinessResource,
    })
    .passthrough()
);
const UserResource: z.ZodType<UserResource> = z.lazy(() =>
  z
    .object({
      id: z.number().int(),
      name: z.string(),
      last_name: z.union([z.string(), z.null()]),
      email: z.string(),
      phone_number: z.union([z.string(), z.null()]),
      email_verified_at: z.union([
        z.string().datetime({ offset: true }),
        z.null(),
      ]),
      image: z.union([z.string(), z.null()]),
      role: z.string(),
      roles: z.array(z.unknown()),
      is_verified: z
        .string()
        .describe("Spatie method - all roles as collection"),
      created_at: z.union([
        z.string().datetime({ offset: true }).describe("accessor"),
        z.null(),
      ]),
      updated_at: z.union([z.string().datetime({ offset: true }), z.null()]),
      businesses: z.array(BusinessResource),
      reviews: z.array(ReviewResource),
      employees: z.array(BusinessEmployeeResource),
      businessClients: z.array(BusinessClientResource),
    })
    .passthrough()
);
const AppointmentResource = z
  .object({
    id: z.number().int(),
    user_id: z.union([z.number().int(), z.null()]),
    business_id: z.union([z.number().int(), z.null()]),
    service_id: z.union([z.number().int(), z.null()]),
    employee_id: z.union([z.number().int(), z.null()]),
    confirmation_token: z.union([z.string(), z.null()]),
    appointment_date: z.string(),
    appointment_start: z.string(),
    appointment_end: z.string(),
    appointment_end_with_cleaning: z.string(),
    status: AppointmentStatus,
    price: z.string(),
    comment: z.union([z.string(), z.null()]),
    created_at: z.union([z.string().datetime({ offset: true }), z.null()]),
    user: UserResource,
    service: ServiceResource,
    employee: BusinessEmployeeResource,
    business: BusinessResource,
  })
  .passthrough();
const AppointmentCreationRequest = z
  .object({
    appointment_date: z.string().datetime({ offset: true }),
    appointment_start: z.string(),
    comment: z.union([z.string().max(1000).optional(), z.null()]),
    business_id: z.number().int(),
    selected_services: z.array(
      z
        .object({
          id: z.number().int(),
          selectedEmployee: z
            .number()
            .int()
            .describe(
              "⚠️ Backend validations: The selected employee for one of the services is invalid."
            ),
        })
        .passthrough()
    ),
  })
  .passthrough();
const UpdateAppointmentStatusRequest = z
  .object({ status: AppointmentStatus })
  .passthrough();
const LoginUserRequest = z
  .object({ email: z.string().email(), password: z.string().min(8) })
  .passthrough();
const StoreUserRequest = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters").max(255),
    last_name: z.string().max(255),
    email: z
      .string()
      .email("Please enter a valid email address")
      .describe(
        "⚠️ Backend validations: This email address is already registered"
      ),
    phone_number: z.union([
      z
        .string()
        .max(15)
        .regex(/^\+?[0-9]{7,15}$/, "Please enter a valid phone number")
        .optional(),
      z.null(),
    ]),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    password_confirmation: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$/)
      .describe("⚠️ Backend validations: Password confirmation does not match"),
    role: z.union([z.enum(["user", "owner"]), z.null()]),
  })
  .passthrough();
const ConfirmCodeRequest = z
  .object({ confirmation_code: z.string().max(6) })
  .passthrough();
const BusinessStoreRequest = z
  .object({
    business_name: z.string().max(255),
    business_type_id: z.number().int(),
    address: z.string().max(255),
    phone: z.union([z.string().max(20).optional(), z.null()]),
    email: z.union([z.string().max(255).email().optional(), z.null()]),
    website: z.union([z.string().max(255).url().optional(), z.null()]),
    description: z.string(),
    business_image: z.union([
      z.instanceof(File).max(2048).optional(),
      z.null(),
    ]),
    opening_hours: z.union([z.string().optional(), z.null()]),
    closing_hours: z.union([z.string().optional(), z.null()]),
    location: z.union([z.string().max(255).optional(), z.null()]),
    lat: z.union([z.number().optional(), z.null()]),
    lng: z.union([z.number().optional(), z.null()]),
  })
  .passthrough();
const Business = z
  .object({
    id: z.number().int(),
    business_name: z.string(),
    address: z.string(),
    phone: z.union([z.string(), z.null()]),
    email: z.union([z.string(), z.null()]),
    website: z.union([z.string(), z.null()]),
    description: z.union([z.string(), z.null()]),
    image: z.union([z.string(), z.null()]),
    rating: z.union([z.string(), z.null()]),
    status: z.union([z.string(), z.null()]),
    opening_hours: z.union([z.string(), z.null()]),
    closing_hours: z.union([z.string(), z.null()]),
    location: z.union([z.string(), z.null()]),
    lat: z.union([z.string(), z.null()]),
    lng: z.union([z.string(), z.null()]),
    owner_id: z.number().int(),
    business_type_id: z.union([z.number().int(), z.null()]),
    is_favorited: z.string(),
    number_of_reviews: z.string(),
    business_type: z.string(),
  })
  .passthrough();
const BusinessUpdateRequest = z
  .object({
    business_name: z.string().max(255),
    business_type_id: z.number().int(),
    address: z.string().max(255),
    phone: z.string().max(20),
    email: z.string().max(255).email(),
    website: z.union([z.string().max(255).url().optional(), z.null()]),
    description: z.string(),
    opening_hours: z.string(),
    closing_hours: z.string(),
    location: z.union([z.string().max(255).optional(), z.null()]),
    lat: z.number(),
    lng: z.number(),
  })
  .passthrough();
const CustomizationOptionResource = z
  .object({ id: z.number().int(), value: z.string(), label: z.string() })
  .passthrough();
const CustomizationSettingResource = z
  .object({
    id: z.number().int(),
    key: z.string(),
    label: z.string(),
    type: z.string(),
    default: z.string(),
    options: z.array(CustomizationOptionResource),
    description: z.string(),
    value: z.string(),
  })
  .passthrough();
const BusinessEmployeeUpdateRequest = z
  .object({
    business_id: z.number().int(),
    name: z.string().max(255),
    last_name: z.string().max(255),
    phone: z.union([z.string().max(15).optional(), z.null()]),
    email: z.union([z.string().max(255).email().optional(), z.null()]),
    image: z.union([z.string().max(255).optional(), z.null()]),
    rating: z.union([z.number().gte(0).lte(5).optional(), z.null()]),
    status: z.enum(["active", "inactive"]),
  })
  .passthrough();
const businessEmployee_assignServices_Body = z
  .object({
    business_id: z.number().int(),
    service_ids: z.union([z.array(z.number().int()), z.null()]),
  })
  .passthrough();
const BusinessTypeResource = z
  .object({ id: z.number().int(), name: z.string() })
  .passthrough();
const ConversationResource = z
  .object({
    id: z.string(),
    businessId: z.string(),
    businessName: z.string(),
    businessAvatar: z.string(),
    userId: z
      .number()
      .int()
      .describe("Include user details only for business owners")
      .optional(),
    userName: z.string().optional(),
    userAvatar: z.union([z.string().optional(), z.null()]),
    lastMessage: z.string(),
    lastMessageAt: z.union([z.string(), z.null()]),
    unreadCount: z.number().int(),
  })
  .passthrough();
const MessageResource = z
  .object({
    id: z.string(),
    senderId: z.string(),
    receiverId: z.string(),
    content: z.string(),
    timestamp: z.string(),
    read: z.boolean(),
    senderType: z.string(),
  })
  .passthrough();
const chat_sendMessage_Body = z
  .object({ conversation_id: z.number().int(), content: z.string() })
  .passthrough();
const contact_contactUs_Body = z
  .object({
    name: z.string().max(100),
    email: z.string().email(),
    message: z.string(),
  })
  .passthrough();
const FavoriteResource = z
  .object({
    id: z.string(),
    user_id: z.string(),
    business_id: z.string(),
    is_favorite: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    business: BusinessResource,
    user: UserResource,
  })
  .passthrough();
const FavoriteStoreRequest = z
  .object({ business_id: z.number().int() })
  .passthrough();
const per_page = z
  .union([z.number().int().gte(1).lte(100).optional(), z.null()])
  .optional();
const type = z.union([z.string().max(255).optional(), z.null()]).optional();
const unread_only = z.union([z.boolean().optional(), z.null()]).optional();
const NotificationResource = z
  .object({
    id: z.number().int(),
    user_id: z.number().int(),
    business_id: z.union([z.number().int(), z.null()]),
    title: z.string(),
    body: z.union([z.string(), z.null()]),
    type: z.string(),
    action: z.union([z.string(), z.null()]),
    screen: z.union([z.string(), z.null()]),
    data: z.union([z.array(z.unknown()), z.null()]),
    is_read: z.boolean(),
    is_clicked: z.boolean(),
    read_at: z.string(),
    clicked_at: z.string(),
    image_url: z.union([z.string(), z.null()]),
    icon: z.union([z.string(), z.null()]),
    created_at: z.string(),
    updated_at: z.string(),
    user: UserResource,
    business: BusinessResource,
  })
  .passthrough();
const PushTokenResource = z
  .object({
    id: z.number().int(),
    user_id: z.number().int(),
    token: z.string(),
    device_uuid: z.string(),
    platform: z.string(),
    device_name: z.union([z.string(), z.null()]),
    is_active: z.boolean(),
    created_at: z.union([z.string().datetime({ offset: true }), z.null()]),
    updated_at: z.union([z.string().datetime({ offset: true }), z.null()]),
    user: UserResource,
  })
  .passthrough();
const pushToken_store_Body = z
  .object({
    token: z.string(),
    device_uuid: z.string(),
    platform: z.enum(["ios", "android", "web"]),
    device_name: z.union([z.string().max(255).optional(), z.null()]),
  })
  .passthrough();
const MessageBag = z.array(z.unknown());
const reviews_store_Body = z
  .object({
    business_id: z.number().int(),
    appointment_id: z.number().int(),
    rating: z.number().gte(1).lte(5),
    comment: z.union([z.string().optional(), z.null()]),
  })
  .passthrough();
const UpdateServiceRequest = z
  .object({
    name: z.string().min(1).max(255),
    price: z.number().gte(0),
    duration: z.number().int().gte(0),
    category_id: z.number().int(),
    cleaning_time_minutes: z.union([
      z.number().int().gte(0).lte(120).optional(),
      z.null(),
    ]),
    mandatory_cleaning_time: z.union([z.boolean().optional(), z.null()]),
  })
  .passthrough();
const users_update_Body = z
  .object({
    name: z.string().max(255),
    last_name: z.string().max(255),
    phone_number: z
      .string()
      .max(15)
      .regex(/^\+?[0-9]{7,15}$/),
  })
  .partial()
  .passthrough();
const UpdatePasswordRequest = z
  .object({
    old_password: z.string().min(8),
    password: z
      .string()
      .min(8)
      .regex(/[!@#$%^&*]/),
    password_confirmation: z.string(),
    google_id: z.union([z.string().max(255), z.null()]),
  })
  .partial()
  .passthrough();
const user_updatePassword_Body = UpdatePasswordRequest.and(
  z
    .object({
      old_password: z.string().min(8),
      password: z.string().min(8),
      google_id: z.union([z.string().max(255), z.null()]),
      password_confirmation: z.string().min(8),
    })
    .partial()
    .passthrough()
);
const UploadProfileImageRequest = z
  .object({ profile_image: z.instanceof(File).max(2048) })
  .passthrough();
const page = z.union([z.number().int().gte(1).optional(), z.null()]).optional();
const user_addClientToBusiness_Body = z
  .object({
    business_id: z.number().int(),
    user_id: z.number().int(),
    notes: z.union([z.string().max(1000).optional(), z.null()]),
  })
  .passthrough();
const user_createUserAndLinkToBusiness_Body = z
  .object({
    business_id: z.number().int(),
    name: z.string().max(255),
    last_name: z.union([z.string().max(255).optional(), z.null()]),
    email: z.union([z.string().max(255).email().optional(), z.null()]),
    phone_number: z.union([
      z
        .string()
        .max(15)
        .regex(/^\+?[0-9]{7,15}$/)
        .optional(),
      z.null(),
    ]),
    notes: z.union([z.string().max(1000).optional(), z.null()]),
  })
  .passthrough();
const workingHour_storeOrUpdate_Body = z
  .object({
    hours: z.array(
      z
        .object({
          day_of_week: z.enum([
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ]),
          opening_time: z.union([z.string().optional(), z.null()]),
          closing_time: z.union([z.string().optional(), z.null()]),
          is_closed: z.boolean(),
        })
        .passthrough()
    ),
  })
  .passthrough();

export const schemas = {
  User,
  AppointmentStatus,
  WorkingHourResource,
  BusinessEmployeeResource,
  ServiceResource,
  ServiceCategoryResource,
  ReviewResource,
  BusinessResource,
  BusinessClientResource,
  UserResource,
  AppointmentResource,
  AppointmentCreationRequest,
  UpdateAppointmentStatusRequest,
  LoginUserRequest,
  StoreUserRequest,
  ConfirmCodeRequest,
  BusinessStoreRequest,
  Business,
  BusinessUpdateRequest,
  CustomizationOptionResource,
  CustomizationSettingResource,
  BusinessEmployeeUpdateRequest,
  businessEmployee_assignServices_Body,
  BusinessTypeResource,
  ConversationResource,
  MessageResource,
  chat_sendMessage_Body,
  contact_contactUs_Body,
  FavoriteResource,
  FavoriteStoreRequest,
  per_page,
  type,
  unread_only,
  NotificationResource,
  PushTokenResource,
  pushToken_store_Body,
  MessageBag,
  reviews_store_Body,
  UpdateServiceRequest,
  users_update_Body,
  UpdatePasswordRequest,
  user_updatePassword_Body,
  UploadProfileImageRequest,
  page,
  user_addClientToBusiness_Body,
  user_createUserAndLinkToBusiness_Body,
  workingHour_storeOrUpdate_Body,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/appointments",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AppointmentCreationRequest,
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Appointments created successfully"),
        data: z.array(AppointmentResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 409,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.string(),
            data: z.literal(""),
          })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
      {
        status: 500,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Failed to create appointments"),
            data: z.literal(""),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/appointments/:id",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("Appointment ID")
          .int()
          .describe("Appointment ID"),
      },
    ],
    response: z.object({ data: AppointmentResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/appointments/:id/update-status",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateAppointmentStatusRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("Appointment ID")
          .int()
          .describe("Appointment ID"),
      },
    ],
    response: z.object({ data: AppointmentResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/appointments/single",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Appointment created successfully"),
        data: AppointmentResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 409,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.string(),
            data: z.literal(""),
          })
          .passthrough(),
      },
      {
        status: 500,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Failed to create appointment"),
            data: z.literal(""),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/available-slots",
    requestFormat: "json",
    parameters: [
      {
        name: "date",
        type: "Query",
        schema: z
          .string()
          .datetime({ offset: true })
          .datetime({ offset: true }),
      },
      {
        name: "services[]",
        type: "Query",
        schema: z.array(z.string()).min(1),
      },
      {
        name: "employees[]",
        type: "Query",
        schema: z.array(z.string()),
      },
      {
        name: "business_id",
        type: "Query",
        schema: z.number().int().int(),
      },
    ],
    response: z.array(z.string()),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/broadcasting/auth",
    requestFormat: "json",
    response: z.string(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/business-employees",
    requestFormat: "json",
    response: z
      .object({ data: z.array(BusinessEmployeeResource) })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/business-employees/:businessEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "businessEmployee",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business employee ID")
          .int()
          .describe("The business employee ID"),
      },
    ],
    response: z.object({ data: BusinessEmployeeResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/business-employees/:businessEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BusinessEmployeeUpdateRequest,
      },
      {
        name: "businessEmployee",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business employee ID")
          .int()
          .describe("The business employee ID"),
      },
    ],
    response: z.object({ data: BusinessEmployeeResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
      {
        status: 500,
        description: `An error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/business-employees/:businessEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "businessEmployee",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business employee ID")
          .int()
          .describe("The business employee ID"),
      },
    ],
    response: z
      .object({ message: z.literal("Resource deleted successfully.") })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/business-employees/:employeeId/services",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: businessEmployee_assignServices_Body,
      },
      {
        name: "employeeId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({ message: z.literal("Services assigned successfully") })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/business-types",
    requestFormat: "json",
    response: z.object({ data: z.array(BusinessTypeResource) }).passthrough(),
  },
  {
    method: "get",
    path: "/businesses",
    requestFormat: "json",
    response: z.object({ data: z.array(BusinessResource) }).passthrough(),
  },
  {
    method: "post",
    path: "/businesses",
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BusinessStoreRequest,
      },
    ],
    response: z.union([Business, z.object({}).partial().passthrough()]),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:business",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: BusinessResource }).passthrough(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/businesses/:business",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BusinessUpdateRequest,
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: BusinessResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:business/appointments",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business appointments retrieved successfully"),
        data: z.array(AppointmentResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:business/dashboard-stats",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z
          .object({
            todayAppointments: z.string(),
            activeClients: z.string(),
            monthlyRevenue: z.string(),
            pendingRequests: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:business/reviews",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: z.array(ReviewResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/businesses/:business/service-categories",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().max(255) }).passthrough(),
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: ServiceCategoryResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/businesses/:business/service-categories/:serviceCategory",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string().max(255) }).passthrough(),
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
      {
        name: "serviceCategory",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The service category ID")
          .int()
          .describe("The service category ID"),
      },
    ],
    response: z.object({ data: ServiceCategoryResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/businesses/:business/service-categories/:serviceCategory",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
      {
        name: "serviceCategory",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The service category ID")
          .int()
          .describe("The service category ID"),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Successfully deleted"),
        data: z.array(z.string()),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/businesses/:business/services",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateServiceRequest,
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: ServiceResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:business/services/:service",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
      {
        name: "service",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The service ID")
          .int()
          .describe("The service ID"),
      },
    ],
    response: z.object({ data: ServiceResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/businesses/:business/services/:service",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateServiceRequest,
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
      {
        name: "service",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The service ID")
          .int()
          .describe("The service ID"),
      },
    ],
    response: z.object({ data: ServiceResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/businesses/:business/services/:service",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
      {
        name: "service",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The service ID")
          .int()
          .describe("The service ID"),
      },
    ],
    response: z.object({}).partial().passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:business/working-hours",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: z.array(WorkingHourResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/businesses/:business/working-hours",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: workingHour_storeOrUpdate_Body,
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: z.array(WorkingHourResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:businessId/clients",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
      {
        name: "page",
        type: "Query",
        schema: page,
      },
      {
        name: "per_page",
        type: "Query",
        schema: per_page,
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business clients retrieved successfully"),
        data: z.array(BusinessClientResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:businessId/clients/search",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().min(2).max(255).min(2).max(255),
      },
      {
        name: "business_id",
        type: "Query",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business clients found successfully"),
        data: z.array(UserResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to search clients for this business"
            ),
            data: z.literal(""),
          })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:businessId/customizations",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({ data: z.array(CustomizationSettingResource) })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/businesses/:businessId/customizations/:customizationId",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ value: z.string() }).partial().passthrough(),
      },
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
      {
        name: "customizationId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({ message: z.literal("Settings updated successfully") })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:businessId/employees",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({ data: z.array(BusinessEmployeeResource) })
      .passthrough(),
  },
  {
    method: "get",
    path: "/businesses/:businessId/employees/all-services",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
      {
        name: "service_ids[]",
        type: "Query",
        schema: z.array(z.number().int()).optional(),
      },
    ],
    response: z
      .object({ data: z.array(BusinessEmployeeResource) })
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:businessId/service-categories",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({ data: z.array(ServiceCategoryResource) })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/:businessId/services",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z.object({ data: z.array(ServiceResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/businesses/newest",
    requestFormat: "json",
    response: z.object({ data: z.array(BusinessResource) }).passthrough(),
  },
  {
    method: "get",
    path: "/businesses/recently-viewed",
    requestFormat: "json",
    response: z.object({ data: z.array(z.string()) }).passthrough(),
  },
  {
    method: "get",
    path: "/businesses/search",
    requestFormat: "json",
    parameters: [
      {
        name: "q",
        type: "Query",
        schema: z.string().optional().default("").optional().default(""),
      },
    ],
    response: z.object({ data: z.array(z.string()) }).passthrough(),
  },
  {
    method: "get",
    path: "/businesses/trending",
    requestFormat: "json",
    response: z.object({ data: z.array(z.string()) }).passthrough(),
  },
  {
    method: "post",
    path: "/chat/conversations",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ business_id: z.number().int() }).passthrough(),
      },
    ],
    response: z.object({ data: ConversationResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/chat/conversations/:businessId",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("**Optional**")
          .default(0)
          .int()
          .describe("**Optional**")
          .default(0),
      },
    ],
    response: z.object({ data: z.array(ConversationResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/chat/conversations/:conversationId/read",
    requestFormat: "json",
    parameters: [
      {
        name: "conversationId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z.object({ success: z.boolean() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `An error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/chat/messages",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: chat_sendMessage_Body,
      },
    ],
    response: z.object({ data: MessageResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `An error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/chat/messages/:conversationId",
    requestFormat: "json",
    parameters: [
      {
        name: "conversationId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z.object({ data: z.array(MessageResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `An error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/clients/add-existing",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: user_addClientToBusiness_Body,
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Client added to business successfully"),
        data: BusinessClientResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/clients/create-and-link",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: user_createUserAndLinkToBusiness_Body,
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("User created and linked to business successfully"),
        data: BusinessClientResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/clients/search-to-add",
    requestFormat: "json",
    parameters: [
      {
        name: "search",
        type: "Query",
        schema: z.string().min(2).max(255).min(2).max(255),
      },
      {
        name: "business_id",
        type: "Query",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal(
          "Users available to add as clients found successfully"
        ),
        data: z.array(UserResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to search users for this business"
            ),
            data: z.literal(""),
          })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/confirm-code/:user",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ confirmation_code: z.string().max(6) })
          .passthrough(),
      },
      {
        name: "user",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The user ID")
          .int()
          .describe("The user ID"),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z
          .object({
            user: UserResource,
            token: z.string(),
            refresh_token: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        schema: z.union([
          z
            .object({
              status: z.literal("An error has occurred..."),
              message: z.literal("Confirmation code has expired."),
              data: z.literal(""),
            })
            .passthrough(),
          z
            .object({
              status: z.literal("An error has occurred..."),
              message: z.literal("Invalid confirmation code."),
              data: z.literal(""),
            })
            .passthrough(),
        ]),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/contact-us",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: contact_contactUs_Body,
      },
    ],
    response: z
      .object({ message: z.literal("Message sent successfully!") })
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/employee",
    requestFormat: "json",
    response: z
      .object({ data: z.array(BusinessEmployeeResource) })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/employee-for-services",
    requestFormat: "json",
    parameters: [
      {
        name: "service_ids[]",
        type: "Query",
        schema: z.array(z.number().int()).optional(),
      },
    ],
    response: z.object({ data: z.array(ServiceResource) }).passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/employee/addEmployee/:business",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StoreUserRequest,
      },
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: BusinessEmployeeResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/employee/addEmployee/:business/add-self-as-employee",
    requestFormat: "json",
    parameters: [
      {
        name: "business",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The business ID")
          .int()
          .describe("The business ID"),
      },
    ],
    response: z.object({ data: BusinessEmployeeResource }).passthrough(),
    errors: [
      {
        status: 400,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("You are already an employee of this business."),
            data: z.null(),
          })
          .passthrough(),
      },
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/favorites",
    requestFormat: "json",
    response: z.object({ data: z.array(FavoriteResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/favorites",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ business_id: z.number().int() }).passthrough(),
      },
    ],
    response: z.object({ data: FavoriteResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/login",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LoginUserRequest,
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z
          .object({
            user: UserResource,
            token: z.string(),
            refresh_token: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Credentials do not match"),
            data: z.literal(""),
          })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/logout",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z
          .object({
            message: z.literal(
              "You have successfully been logged out and your token has been removed"
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/me",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z.object({ user: UserResource }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/my-businesses",
    requestFormat: "json",
    response: z.object({ data: z.array(BusinessResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/notifications",
    requestFormat: "json",
    parameters: [
      {
        name: "per_page",
        type: "Query",
        schema: per_page,
      },
      {
        name: "type",
        type: "Query",
        schema: type,
      },
      {
        name: "unread_only",
        type: "Query",
        schema: unread_only,
      },
    ],
    response: z
      .object({
        notifications: z.array(NotificationResource),
        meta: z
          .object({
            current_page: z.number().int(),
            last_page: z.number().int(),
            per_page: z.number().int(),
            total: z.number().int(),
            unread_count: z.number().int(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/notifications",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("All notifications deleted successfully"),
        data: z.object({ deleted_count: z.unknown() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/notifications/:id",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Notification deleted successfully"),
        data: z.null(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Notification not found"),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/notifications/:id/clicked",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Notification marked as clicked"),
        data: NotificationResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Notification not found"),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/notifications/:id/read",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Notification marked as read"),
        data: NotificationResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Notification not found"),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/notifications/business/:businessId",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "per_page",
        type: "Query",
        schema: per_page,
      },
      {
        name: "type",
        type: "Query",
        schema: type,
      },
      {
        name: "unread_only",
        type: "Query",
        schema: unread_only,
      },
    ],
    response: z
      .object({
        notifications: z.array(NotificationResource),
        meta: z
          .object({
            current_page: z.number().int(),
            last_page: z.number().int(),
            per_page: z.number().int(),
            total: z.number().int(),
            unread_count: z.number().int(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/notifications/business/:businessId",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("All business notifications deleted successfully"),
        data: z.object({ deleted_count: z.unknown() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/notifications/business/:businessId/:id",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business notification deleted successfully"),
        data: z.null(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Notification not found"),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/notifications/business/:businessId/:id/clicked",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business notification marked as clicked"),
        data: NotificationResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Notification not found"),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/notifications/business/:businessId/:id/read",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business notification marked as read"),
        data: NotificationResource,
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Notification not found"),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/notifications/business/:businessId/mark-all-read",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("All business notifications marked as read"),
        data: z.object({ updated_count: z.number().int() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/notifications/business/:businessId/unread-count",
    requestFormat: "json",
    parameters: [
      {
        name: "businessId",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Business unread count retrieved successfully"),
        data: z.object({ count: z.number().int() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal(
              "Unauthorized to access this business notifications"
            ),
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/notifications/mark-all-read",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("All notifications marked as read"),
        data: z.object({ updated_count: z.number().int() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/notifications/unread-count",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Unread count retrieved successfully"),
        data: z.object({ count: z.number().int() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/push-tokens",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Push tokens retrieved successfully"),
        data: z.array(PushTokenResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/push-tokens",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: pushToken_store_Body,
      },
    ],
    response: z.union([
      z
        .object({
          status: z.literal("Request was successful."),
          message: z.literal("Push token registered successfully"),
          data: PushTokenResource,
        })
        .passthrough(),
      z
        .object({
          status: z.literal("Request was successful."),
          message: z.literal("Push token updated successfully"),
          data: PushTokenResource,
        })
        .passthrough(),
      z
        .object({
          status: z.literal("Request was successful."),
          message: z.literal(
            "Push token transferred to your account successfully"
          ),
          data: PushTokenResource,
        })
        .passthrough(),
    ]),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: MessageBag,
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/push-tokens",
    requestFormat: "json",
    parameters: [
      {
        name: "device_uuid",
        type: "Query",
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("Push token deactivated successfully"),
        data: z.null(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: z.literal("Push token not found"),
            data: z.null(),
          })
          .passthrough(),
      },
      {
        status: 422,
        schema: z
          .object({
            status: z.literal("An error has occurred..."),
            message: MessageBag,
            data: z.null(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/refresh-token",
    requestFormat: "json",
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.null(),
        data: z
          .object({ token: z.string(), refresh_token: z.string() })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/register",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: StoreUserRequest,
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("User created successfully"),
        data: z
          .object({
            user: UserResource,
            token: z.string(),
            refresh_token: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/resend-code/:user",
    requestFormat: "json",
    parameters: [
      {
        name: "user",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The user ID")
          .int()
          .describe("The user ID"),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal(
          "Confirmation code has been sent to your email address."
        ),
        data: z.object({ email: z.string() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/reviews",
    requestFormat: "json",
    response: z.object({ data: z.array(ReviewResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/reviews",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: reviews_store_Body,
      },
    ],
    response: z.object({ data: ReviewResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "delete",
    path: "/reviews/:id",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({ message: z.literal("Review deleted successfully") })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "post",
    path: "/upload-profile-image",
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ profile_image: z.instanceof(File).max(2048) })
          .passthrough(),
      },
    ],
    response: z.object({ data: UserResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/user",
    requestFormat: "json",
    response: User,
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/users",
    requestFormat: "json",
    response: z.object({ data: z.array(UserResource) }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/users/:id",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z.object({ data: UserResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/users/:id/password",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: user_updatePassword_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z.object({ data: UserResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "put",
    path: "/users/:user",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: users_update_Body,
      },
      {
        name: "user",
        type: "Path",
        schema: z
          .number()
          .int()
          .describe("The user ID")
          .int()
          .describe("The user ID"),
      },
    ],
    response: z.object({ data: UserResource }).passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 403,
        description: `Authorization error`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
      {
        status: 422,
        description: `Validation error`,
        schema: z
          .object({
            message: z.string().describe("Errors overview."),
            errors: z.record(z.array(z.string())),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: "get",
    path: "/users/:userId/appointments",
    requestFormat: "json",
    parameters: [
      {
        name: "userId",
        type: "Path",
        schema: z.number().int().int(),
      },
    ],
    response: z
      .object({
        status: z.literal("Request was successful."),
        message: z.literal("User appointments retrieved successfully"),
        data: z.array(AppointmentResource),
      })
      .passthrough(),
    errors: [
      {
        status: 401,
        description: `Unauthenticated`,
        schema: z
          .object({ message: z.string().describe("Error overview.") })
          .passthrough(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
