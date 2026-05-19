import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUpdateMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Car } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const updateMe = useUpdateMe();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "",
    vehiclePlate: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        vehicleType: user.vehicleType || "",
        vehiclePlate: user.vehiclePlate || ""
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMe.mutate({
      data: formData
    }, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your profile information has been saved successfully.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not update profile.",
        });
      }
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
        {/* Sidebar/Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4 group">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary/90 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-center">{user.name}</h2>
          <p className="text-gray-500 text-sm mb-4">{user.email}</p>
          
          <div className="w-full bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Member since</span>
              <span className="font-medium">2024</span>
            </div>
            {user.rating && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Rating</span>
                <span className="font-medium text-primary">★ {user.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Forms */}
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your contact details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <Button type="submit" disabled={updateMe.isPending} className="bg-gray-900 text-white hover:bg-gray-800">
                  {updateMe.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-primary" />
                Vehicle Details
              </CardTitle>
              <CardDescription>Information about the vehicle you drive.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type / Model</Label>
                  <Input 
                    id="vehicleType" 
                    placeholder="e.g. Honda Civic, Ford F-150"
                    value={formData.vehicleType} 
                    onChange={e => setFormData({...formData, vehicleType: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">License Plate</Label>
                  <Input 
                    id="vehiclePlate" 
                    placeholder="e.g. ABC 123"
                    value={formData.vehiclePlate} 
                    onChange={e => setFormData({...formData, vehiclePlate: e.target.value})} 
                  />
                </div>
                <Button type="submit" disabled={updateMe.isPending} variant="outline">
                  {updateMe.isPending ? "Saving..." : "Update Vehicle"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
