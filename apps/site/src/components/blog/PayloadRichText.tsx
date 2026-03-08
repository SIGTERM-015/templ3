import { RichText as RichTextRenderer } from '@payloadcms/richtext-lexical/react'

type Props = {
  data: unknown
}

export function PayloadRichText({ data }: Props) {
  if (!data) return null

  return <RichTextRenderer data={data as never} />
}
