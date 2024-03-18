"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const SearchBar = () => {
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("query") || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [isSearching, startTransition] = useTransition();

  const router = useRouter();

  const search = () => {
    startTransition(() => {
      router.push(`/search?query=${query}`);
    });
  };

  return (
    <div className="w-full relative h-14 flex flex-col bg-white">
      <div className="h-14 relative z-10 rounded-md">
        <Input
          disabled={isSearching}
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search();
            }
            if (e.key === "Escape") {
              inputRef.current?.blur();
            }
          }}
          className="h-full absolute inset-0"
        />
        <Button
          disabled={isSearching}
          className="absolute h-full right-0 rounded-l-none"
          size="sm"
          onClick={search}
        >
          {isSearching ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Search className="size-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
