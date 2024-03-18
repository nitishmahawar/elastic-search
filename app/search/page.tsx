import { db } from "@/db";
import { Product, productsTable } from "@/db/schema";
import { index } from "@/lib/vector";
import { vectorize } from "@/lib/vectorize";
import { sql } from "drizzle-orm";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

  if (products.length < 3) {
    const vector = await vectorize(query);
    const res = await index.query({
      vector,
      topK: 5,
      includeMetadata: true,
    });

    const vectorProducts = res
      .filter((existingProduct) => {
        if (
          products.some((product) => product.id === existingProduct.id) ||
          existingProduct.score < 0.9
        ) {
          return false;
        } else {
          true;
        }
      })
      .map(({ metadata }) => metadata!) as Product[];

    products.push(...vectorProducts);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 bg-white shadow-md rounded-b-md mt-6">
        <X className="mx-auto h-8 w-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No results</h3>
        <p className="mt-1 text-sm mx-auto max-w-prose text-gray-500">
          Sorry, we couldn't find any matches for{" "}
          <span className="text-green-600 font-medium">{query}</span>.
        </p>
      </div>
    );
  }

  return (
    <ul className="py-4 divide-y divide-zinc-200 bg-white shadow-md mt-6 rounded-lg">
      {products.slice(0, 3).map(({ id, imageId, name, description, price }) => (
        <Link key={id} href={`/products/${id}`}>
          <li className="mx-auto py-4 px-8 flex space-x-4">
            <div className="relative flex items-center bg-zinc-100 rounded-lg size-40">
              <Image
                src={`/${imageId}`}
                loading="eager"
                fill
                alt="product-image"
              />
            </div>
            <div className="w-full flex-1 space-y-2 py-1">
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              <p className="prose prose-sm text-gray-500 line-clamp-3">
                {description}
              </p>
              <p className="text-base font-medium text-gray-900">
                ${price.toFixed(2)}
              </p>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
};

export default Page;
