import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useGetListing, 
  useCreateListing, 
  useUpdateListing,
  useGetSuggestedPrice,
  getGetListingQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide more details"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  hourlyRate: z.coerce.number().min(1, "Hourly rate must be at least $1"),
  dailyRate: z.coerce.number().optional(),
  monthlyRate: z.coerce.number().optional(),
  pricingType: z.string().default("all"),
  totalSpots: z.coerce.number().min(1, "Must have at least 1 spot"),
  vehicleTypes: z.array(z.string()).min(1, "Select at least one vehicle type"),
  amenities: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

const VEHICLE_TYPES = ["Compact", "Sedan", "SUV", "Truck", "Motorcycle"];
const AMENITIES = ["Covered", "Security Camera", "EV Charging", "Gated", "24/7 Access", "Lighting"];

export default function ListingForm() {
  const params = useParams();
  const isEditing = !!params.id;
  const id = isEditing ? Number(params.id) : undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: listing, isLoading: isLoadingListing } = useGetListing(id as number, {
    query: { enabled: isEditing, queryKey: getGetListingQueryKey(id as number) }
  });

  const createListing = useCreateListing();
  const updateListing = useUpdateListing();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      hourlyRate: 5,
      dailyRate: undefined,
      monthlyRate: undefined,
      pricingType: "all",
      totalSpots: 1,
      vehicleTypes: ["Sedan", "SUV"],
      amenities: [],
    },
  });

  useEffect(() => {
    if (listing && isEditing) {
      form.reset({
        title: listing.title,
        description: listing.description || "",
        address: listing.address,
        city: listing.city,
        state: listing.state || "",
        hourlyRate: listing.hourlyRate,
        dailyRate: listing.dailyRate || undefined,
        monthlyRate: listing.monthlyRate || undefined,
        pricingType: listing.pricingType || "all",
        totalSpots: listing.totalSpots,
        vehicleTypes: listing.vehicleTypes || [],
        amenities: listing.amenities || [],
      });
    }
  }, [listing, isEditing, form]);

  const cityValue = form.watch("city");
  const { data: suggestedPrice } = useGetSuggestedPrice({ city: cityValue }, {
    query: { enabled: cityValue.length > 2 }
  });

  const onSubmit = (data: FormValues) => {
    if (isEditing && id) {
      updateListing.mutate({ id, data }, {
        onSuccess: () => {
          toast({ title: "Listing updated successfully" });
          setLocation("/host/listings");
        }
      });
    } else {
      createListing.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Listing created successfully" });
          setLocation("/host/listings");
        }
      });
    }
  };

  const applySuggestedPrices = () => {
    if (suggestedPrice) {
      form.setValue("hourlyRate", suggestedPrice.hourlyRate);
      form.setValue("dailyRate", suggestedPrice.dailyRate);
      form.setValue("monthlyRate", suggestedPrice.monthlyRate);
      toast({ title: "Applied suggested prices based on market rates" });
    }
  };

  if (isEditing && isLoadingListing) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const isPending = createListing.isPending || updateListing.isPending;

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isEditing ? "Edit Listing" : "List your parking space"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basics */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold border-b pb-4">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Secure Covered Spot near Downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the space, accessibility, surrounding area..." className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold border-b pb-4">Location</h2>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold">Pricing</h2>
                {suggestedPrice && (
                  <Button type="button" variant="outline" size="sm" onClick={applySuggestedPrices} className="text-primary border-primary/20 bg-primary/5">
                    <Sparkles className="w-4 h-4 mr-2" /> Apply smart pricing
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Rate ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Rate ($) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" {...field} value={field.value || ''} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold border-b pb-4">Space Details</h2>
              
              <FormField
                control={form.control}
                name="totalSpots"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Number of spots available</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-base">Allowed Vehicle Types</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {VEHICLE_TYPES.map((type) => (
                    <FormField
                      key={type}
                      control={form.control}
                      name="vehicleTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={type}
                            className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(type)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, type])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== type
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {type}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage>{form.formState.errors.vehicleTypes?.message}</FormMessage>
              </div>

              <div className="space-y-4">
                <FormLabel className="text-base">Amenities</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES.map((amenity) => (
                    <FormField
                      key={amenity}
                      control={form.control}
                      name="amenities"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={amenity}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, amenity])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== amenity
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {amenity}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4 pb-12">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="rounded-xl px-8" disabled={isPending}>
              {isPending ? "Saving..." : (isEditing ? "Save Changes" : "Publish Listing")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
