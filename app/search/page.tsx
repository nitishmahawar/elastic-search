import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({
  searchParams: { query },
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  if (Array.isArray(query) || !query) {
    return redirect("/");
  }

  let products = await db
    .select()
    .from(productsTable)
    .where(
      sql`
  to_tsvector('simple', lower(${productsTable.name} || ' ' || ${
        productsTable.description
      })) @@ to_tsquery('simple', lower(${query.trim().split(" ").join(" & ")}))
  `
    )
    .limit(3);

  return <div>{JSON.stringify(products)}</div>;
};

export default Page;
