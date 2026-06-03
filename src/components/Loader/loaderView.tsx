import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";

type LoadingProps = {
  isOpen: boolean;
  message: string;
};

export const Loading = ({ isOpen, message }: LoadingProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-[calc(100vw-4rem)] max-w-[360px] bg-white mx-auto [&>button]:hidden border-none">
        <VisuallyHidden>
          <DialogTitle>Carregando</DialogTitle>
        </VisuallyHidden>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "130px",
            gap: "10px",
          }}
        >
          <img
            src="/loading-logo.svg"
            alt="Loading"
            className="w-[265px] h-auto"
          />
          <Loader2 className="mr-2 h-9 w-9 animate-spin" color="#1C5DB7" />
          <p className="text-center text-sm" style={{ color: "#1C5DB7" }}>
            {message} ...<span className="animate-spin">⏳</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
