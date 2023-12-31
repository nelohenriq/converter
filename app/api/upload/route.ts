import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { extname } from "path";

export async function Post(req: NextRequest) {
  // load the file from the request
  const data = await req.formData();
  const file: File = data.get("file") as unknown as File;
  const to = data.get("to") as unknown as string;
  const from = extname(file.name).replace(".", "");

  // validate the file
  if (!file) {
    return new NextResponse(JSON.stringify({ error: "No file provided" }), {
      status: 400,
    });
  }

  if (!to) {
    return new NextResponse(JSON.stringify({ error: "No 'to' provided" }), {
      status: 400,
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  // upload the file to S3

  // save the metadata to the Postgres
  const conversion = await prisma.conversion.create({
    data: {
      fileLocation: "s3://some-bucket/some-file.mp4",
      from,
      to,
      current: from,
      status: "PENDING",
    },
  });

  // return a uuid

  return NextResponse.json({ id: conversion.id });
}
