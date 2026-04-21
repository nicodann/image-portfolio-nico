import {
  Dispatch,
  SetStateAction,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export default function UploadSiteInfoForm({
  getToken,
  setIsEditingTitle,
  onOptimisticUpdate,
  onError,
}: {
  getToken: () => string | null;
  setIsEditingTitle: Dispatch<SetStateAction<boolean>>;
  onOptimisticUpdate: (title: string) => void;
  onError: (message: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [titleInputValue, setTitleInputValue] = useState("");
  const inputWidthRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState<number | undefined>(20);

  useLayoutEffect(() => {
    inputWidthRef.current?.getBoundingClientRect().width &&
      setInputWidth(inputWidthRef.current?.getBoundingClientRect().width);
  }, [titleInputValue]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      onError("Not authenticated");
      return;
    }

    const title = titleInputValue.trim();

    // Optimistically close the form and update the displayed title
    onOptimisticUpdate(title);
    setIsEditingTitle(false);
    try {
      const res = await fetch("/api/upload-site-info", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Save failed (${res.status})`);
      }
    } catch (err) {
      // Rollback — reopen form and surface the error in the parent
      setIsEditingTitle(true);
      onError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        <div
          id="form-fields_buttons"
          className="flex gap-4 items-center flex-wrap"
        >
          <span
            aria-hidden
            ref={inputWidthRef}
            className="input-title absolute invisible whitespace-pre"
          >
            {titleInputValue}
          </span>
          <input
            name="title"
            type="text"
            required
            autoFocus
            value={titleInputValue}
            style={{ width: `${inputWidth}px` }}
            onChange={(e) => {
              setTitleInputValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditingTitle(false);
            }}
            className="input-title bg-transparent border-none outline-none p-0 leading-none"
          />

          <button type="button" onClick={() => setIsEditingTitle(false)}>
            X
          </button>
        </div>
      </div>
    </form>
  );
}
