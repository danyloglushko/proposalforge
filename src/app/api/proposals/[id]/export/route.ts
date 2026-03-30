import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
} from "docx";

/** Convert simple Markdown to docx Paragraph array (best-effort). */
function markdownToDocx(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    // Headings
    if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 })
      );
    } else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 })
      );
    } else if (line.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 })
      );
    }
    // Bullet list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      paragraphs.push(
        new Paragraph({
          text: line.slice(2),
          bullet: { level: 0 },
        })
      );
    }
    // Numbered list
    else if (/^\d+\. /.test(line)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^\d+\. /, ""),
          numbering: { reference: "default-numbering", level: 0 },
        })
      );
    }
    // Bold/italic inline — strip markdown markers for simplicity
    else if (line.trim() === "") {
      paragraphs.push(new Paragraph({ text: "" }));
    } else {
      // Parse inline bold (**text**) and italic (*text*)
      const runs: TextRun[] = [];
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      for (const part of parts) {
        if (part.startsWith("**") && part.endsWith("**")) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else if (part.startsWith("*") && part.endsWith("*")) {
          runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else if (part) {
          runs.push(new TextRun({ text: part }));
        }
      }
      paragraphs.push(new Paragraph({ children: runs }));
    }
  }

  return paragraphs;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: {
      signature: { select: { signerName: true, signedAt: true } },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const currency = proposal.currency ?? "USD";
  const amountFormatted = proposal.totalAmount
    ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        proposal.totalAmount
      )
    : null;

  const headerRows: Paragraph[] = [
    new Paragraph({
      text: proposal.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Prepared for: ", bold: true }),
        new TextRun({ text: proposal.clientName }),
      ],
    }),
    ...(amountFormatted
      ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Total Investment: ", bold: true }),
              new TextRun({ text: amountFormatted, bold: true }),
            ],
          }),
        ]
      : []),
    ...(proposal.validUntil
      ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Valid Until: ", bold: true }),
              new TextRun({
                text: new Date(proposal.validUntil).toLocaleDateString(),
              }),
            ],
          }),
        ]
      : []),
    new Paragraph({ text: "" }),
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
      text: "",
    }),
    new Paragraph({ text: "" }),
  ];

  const contentParagraphs = markdownToDocx(proposal.content);

  const footerRows: Paragraph[] = [
    new Paragraph({ text: "" }),
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
      text: "",
    }),
    ...(proposal.signature
      ? [
          new Paragraph({
            children: [
              new TextRun({ text: "Accepted by: ", bold: true }),
              new TextRun({ text: proposal.signature.signerName }),
              new TextRun({ text: " on " }),
              new TextRun({
                text: new Date(proposal.signature.signedAt).toLocaleDateString(),
              }),
            ],
          }),
        ]
      : []),
    new Paragraph({
      children: [
        new TextRun({
          text: "Generated by ProposalForge",
          color: "999999",
          size: 18,
        }),
      ],
    }),
  ];

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        children: [...headerRows, ...contentParagraphs, ...footerRows],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  // Copy into a plain ArrayBuffer for Response compatibility
  const arrayBuffer: ArrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;

  const safeName = proposal.title
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()
    .slice(0, 60);

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeName}.docx"`,
    },
  });
}
