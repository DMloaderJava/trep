import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/storage";

export type ChatReaction = {
  id: string;
  name: string;
  image_url: string;
  emoji_fallback: string | null;
  imageSignedUrl?: string;
};

export function useChatReactions() {
  return useQuery({
    queryKey: ["chat-reactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_reactions")
        .select("*")
        .order("created_at", { ascending: true });
      const reactions = (data ?? []) as ChatReaction[];
      const withUrls = await Promise.all(
        reactions.map(async (r) => {
          try {
            const url = await getSignedUrl("reaction-proposals", r.image_url);
            return { ...r, imageSignedUrl: url };
          } catch {
            return r;
          }
        }),
      );
      return withUrls;
    },
  });
}
