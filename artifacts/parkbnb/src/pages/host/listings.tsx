import { Link } from "wouter";
import { useGetMyListings, useDeleteListing, getGetMyListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit2, Trash2, MapPin, Eye, Star, Car } from "lucide-react";

const PARKING_PHOTO = "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&q=80&auto=format&fit=crop";

export default function HostListings() {
  const { data: listings, isLoading } = useGetMyListings();
  const deleteListing = useDeleteListing();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    deleteListing.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Listing deleted" });
        queryClient.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to delete listing" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Host Panel</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">My Listings</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {listings?.length || 0} parking space{listings?.length !== 1 ? "s" : ""} listed
              </p>
            </div>
            <Button asChild className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 gap-2">
              <Link href="/host/listings/new">
                <Plus className="w-4 h-4" /> Add New Spot
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <Skeleton className="h-52 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5 text-4xl">🅿️</div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-7 text-sm leading-relaxed">
              Create your first listing to start earning from your parking space. It only takes 5 minutes.
            </p>
            <Button asChild size="lg" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
              <Link href="/host/listings/new">Create First Listing</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings?.map(listing => {
              const photo = listing.photos?.[0] || PARKING_PHOTO;
              const statusColors: Record<string, string> = {
                active: "bg-emerald-100 text-emerald-700",
                pending: "bg-amber-100 text-amber-700",
                inactive: "bg-gray-100 text-gray-600",
              };
              const statusColor = statusColors[listing.status || "active"] || statusColors.inactive;

              return (
                <div key={listing.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={photo}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = PARKING_PHOTO; }}
                    />
                    {/* Status badge */}
                    <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full ${statusColor} capitalize`}>
                      {listing.status || "active"}
                    </span>
                    {/* Actions menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white/95 shadow-md">
                            <MoreVertical className="w-4 h-4 text-gray-700" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg gap-2">
                            <Link href={`/host/listings/${listing.id}/edit`}>
                              <Edit2 className="w-4 h-4" /> Edit listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg gap-2">
                            <Link href={`/listings/${listing.id}`}>
                              <Eye className="w-4 h-4" /> View public page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg gap-2"
                            onClick={() => handleDelete(listing.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 mb-1">{listing.title}</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {listing.city}, {listing.state}
                    </p>

                    {/* Pricing pills */}
                    <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-full">
                        ₹{listing.hourlyRate}/hr
                      </span>
                      {listing.dailyRate && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-3 py-1.5 rounded-full">
                          ₹{listing.dailyRate}/day
                        </span>
                      )}
                      {listing.monthlyRate && (
                        <span className="bg-violet-50 text-violet-700 border border-violet-100 text-xs font-bold px-3 py-1.5 rounded-full">
                          ₹{listing.monthlyRate}/mo
                        </span>
                      )}
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Car className="w-3.5 h-3.5" />
                        {listing.availableSpots}/{listing.totalSpots} spots
                      </div>
                      {listing.rating && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {listing.rating.toFixed(1)} ({listing.reviewCount})
                        </div>
                      )}
                      <Link href={`/host/listings/${listing.id}/edit`}>
                        <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                          Edit →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
