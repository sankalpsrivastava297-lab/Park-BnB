import { useState } from "react";
import { useCreateReview, getGetListingReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  listingId: number;
  listingTitle: string;
  bookingId: number;
}

const QUICK_TAGS = [
  "Great location",
  "Easy access",
  "Safe & secure",
  "Good value",
  "Clean space",
  "Helpful host",
  "Exactly as described",
  "Would book again",
];

export function ReviewModal({ open, onClose, listingId, listingTitle, bookingId }: ReviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit() {
    if (rating === 0) {
      toast({ variant: "destructive", title: "Please select a rating" });
      return;
    }

    const fullComment = [comment, tags.length > 0 ? `✓ ${tags.join(" · ")}` : ""].filter(Boolean).join("\n\n");

    createReview.mutate({
      data: { listingId, rating, comment: fullComment || `${rating}-star experience.` }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetListingReviewsQueryKey(listingId) });
        setSubmitted(true);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Failed to submit review", description: "Please try again." });
      }
    });
  }

  function handleClose() {
    if (createReview.isPending) return;
    setRating(0);
    setComment("");
    setTags([]);
    setSubmitted(false);
    onClose();
  }

  const starLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];
  const activeRating = hovered || rating;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xl">Review Submitted!</p>
              <p className="text-gray-500 text-sm mt-1">Thank you for sharing your experience.</p>
            </div>
            <Button className="w-full rounded-xl mt-2" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-0">
              <DialogTitle className="text-lg font-bold text-gray-900">Rate Your Experience</DialogTitle>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{listingTitle}</p>
            </DialogHeader>

            <div className="px-6 py-5 space-y-5">
              {/* Star rating */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-10 w-10 transition-colors",
                          star <= activeRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-100 text-gray-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {activeRating > 0 && (
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    activeRating >= 4 ? "text-green-600" : activeRating >= 3 ? "text-amber-600" : "text-red-500"
                  )}>
                    {starLabels[activeRating]}
                  </span>
                )}
              </div>

              {/* Quick tags */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">What stood out?</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors",
                        tags.includes(tag)
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      )}
                    >
                      {tags.includes(tag) && "✓ "}{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text review */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tell us more <span className="text-gray-400 font-normal normal-case">(optional)</span></p>
                <Textarea
                  placeholder="How was the parking experience? Was it easy to find? Any tips for other drivers?"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="rounded-xl resize-none text-sm"
                  rows={3}
                  maxLength={500}
                />
                {comment.length > 0 && (
                  <p className="text-right text-xs text-gray-400 mt-1">{comment.length}/500</p>
                )}
              </div>
            </div>

            <div className="border-t px-6 py-4 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleSubmit}
                disabled={rating === 0 || createReview.isPending}
              >
                {createReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
