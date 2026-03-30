import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  ShadingType,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
} from "docx";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProposalStructure } from "@/types/proposal";

const INDIGO = "3730A3"; // indigo-700

function heading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 120 },
  });
}

function body(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 120 },
  });
}

function tableHeaderCell(text: string) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })],
      }),
    ],
    shading: { type: ShadingType.SOLID, color: INDIGO, fill: INDIGO },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

function tableCell(text: string, bold = false) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold, size: 20 })],
      }),
    ],
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
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
  });

  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const p = proposal.content as unknown as ProposalStructure;
  const currency = p.currency ?? "USD";

  const coverParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: p.title ?? proposal.title,
          bold: true,
          size: 52,
          color: "FFFFFF",
        }),
      ],
      spacing: { before: convertInchesToTwip(1), after: 240 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Prepared for  ", size: 24, color: "C7D2FE" }),
        new TextRun({ text: p.clientName, size: 24, bold: true, color: "FFFFFF" }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "By  ", size: 24, color: "C7D2FE" }),
        new TextRun({ text: p.freelancerName, size: 24, bold: true, color: "FFFFFF" }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: p.date, size: 22, color: "A5B4FC" })],
      spacing: { after: 0 },
    }),
    // Page break after cover
    new Paragraph({ children: [], pageBreakBefore: true }),
  ];

  const bodyChildren = [];

  if (p.executiveSummary) {
    bodyChildren.push(heading("Executive Summary"), body(p.executiveSummary));
  }
  if (p.problem) {
    bodyChildren.push(heading("Problem / Opportunity"), body(p.problem));
  }
  if (p.solution) {
    bodyChildren.push(heading("Proposed Solution"), body(p.solution));
  }

  if (p.scopeOfWork?.length) {
    bodyChildren.push(heading("Scope of Work"));
    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          // @ts-expect-error docx v9 type mismatch — insideH is valid at runtime
          insideH: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          insideV: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        },
        rows: [
          new TableRow({
            children: [
              tableHeaderCell("Deliverable"),
              tableHeaderCell("Description"),
            ],
            tableHeader: true,
          }),
          ...p.scopeOfWork.map(
            (r) =>
              new TableRow({
                children: [tableCell(r.deliverable), tableCell(r.description)],
              })
          ),
        ],
      })
    );
  }

  if (p.timeline?.length) {
    bodyChildren.push(heading("Implementation Timeline"));
    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          // @ts-expect-error docx v9 type mismatch — insideH is valid at runtime
          insideH: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          insideV: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        },
        rows: [
          new TableRow({
            children: [
              tableHeaderCell("Phase"),
              tableHeaderCell("Duration"),
              tableHeaderCell("Description"),
            ],
            tableHeader: true,
          }),
          ...p.timeline.map(
            (r) =>
              new TableRow({
                children: [
                  tableCell(r.phase),
                  tableCell(r.duration),
                  tableCell(r.description),
                ],
              })
          ),
        ],
      })
    );
  }

  if (p.pricing?.length) {
    bodyChildren.push(heading("Investment"));
    const grandTotal = p.pricing.reduce((s, r) => s + (r.total ?? 0), 0);
    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          // @ts-expect-error docx v9 type mismatch — insideH is valid at runtime
          insideH: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
          insideV: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        },
        rows: [
          new TableRow({
            children: [
              tableHeaderCell("Item"),
              tableHeaderCell("Qty"),
              tableHeaderCell("Rate"),
              tableHeaderCell("Total"),
            ],
            tableHeader: true,
          }),
          ...p.pricing.map(
            (r) =>
              new TableRow({
                children: [
                  tableCell(r.item),
                  tableCell(String(r.qty)),
                  tableCell(fmt(r.rate, currency), false),
                  tableCell(fmt(r.total, currency), false),
                ],
              })
          ),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 3,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: "Grand Total", bold: true, size: 22 })],
                  }),
                ],
                shading: { type: ShadingType.SOLID, color: "EEF2FF", fill: "EEF2FF" },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: fmt(grandTotal, currency),
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),
                ],
                shading: { type: ShadingType.SOLID, color: "EEF2FF", fill: "EEF2FF" },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
              }),
            ],
          }),
        ],
      })
    );
  }

  if (p.terms) {
    bodyChildren.push(heading("Terms and Assumptions"), body(p.terms));
  }
  if (p.nextSteps) {
    bodyChildren.push(heading("Next Steps"), body(p.nextSteps));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [...coverParagraphs, ...bodyChildren],
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 26, bold: true, color: INDIGO },
          paragraph: { spacing: { before: 280, after: 120 } },
        },
      ],
    },
  });

  const buffer = await Packer.toBuffer(doc);

  const safeName = (p.title ?? proposal.title)
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeName}.docx"`,
    },
  });
}
