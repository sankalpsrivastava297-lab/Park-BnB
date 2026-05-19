import { Link } from "wouter";
import { useGetMyListings, useDeleteListing, getGetMyListingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Edit2, Trash2, MapPin } from "lucide-react";

export default function HostListings() {
  const { data: listings, isLoading } = useGetMyListings();
  const deleteListing = useDeleteListing();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    
    deleteListing.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Listing deleted" });
        queryClient.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to delete listing" });
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Listings</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove your parking spaces.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/host/listings/new">
            <Plus className="w-4 h-4 mr-2" /> Add New Spot
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Create your first listing to start earning from your parking space.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/host/listings/new">Create Listing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings?.map(listing => (
            <Card key={listing.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-48 bg-gray-100">
                <img 
                  src={listing.photos?.[0] || "/images/parking-1.png"} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                />
                <Badge 
                  className={`absolute top-3 left-3 shadow-sm border-0 ${
                    listing.status === 'active' ? 'bg-green-500 hover:bg-green-600 text-white' : 
                    listing.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 
                    'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                >
                  {listing.status}
                </Badge>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="w-8 h-8 rounded-full bg-white/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/host/listings/${listing.id}/edit`}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/listings/${listing.id}`}>
                          <MapPin className="w-4 h-4 mr-2" /> View public
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(listing.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">{listing.title}</h3>
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.city}, {listing.state}
                </p>
                <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                  <Badge variant="outline" className="font-normal text-xs bg-gray-50">${listing.hourlyRate}/hr</Badge>
                  {listing.dailyRate && <Badge variant="outline" className="font-normal text-xs bg-gray-50">${listing.dailyRate}/day</Badge>}
                  {listing.monthlyRate && <Badge variant="outline" className="font-normal text-xs bg-gray-50">${listing.monthlyRate}/mo</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
