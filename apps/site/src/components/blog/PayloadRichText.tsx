import { RichText as RichTextRenderer } from '@payloadcms/richtext-lexical/react'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import {
  BookmarkCard,
  CalloutBlock,
  CodePenEmbed,
  DividerBlock,
  GitHubGistEmbed,
  SpotifyEmbed,
  TwitterEmbed,
  VideoEmbed,
  YouTubeEmbed,
} from './Embeds'
import './embeds.css'

type Props = {
  data: unknown
}

type BlockNode = {
  fields: unknown
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    youtube: ({ node }: { node: BlockNode }) => (
      <YouTubeEmbed {...(node.fields as { url: string; caption?: string })} />
    ),
    spotify: ({ node }: { node: BlockNode }) => (
      <SpotifyEmbed {...(node.fields as { url: string; height?: 'compact' | 'large' })} />
    ),
    twitter: ({ node }: { node: BlockNode }) => <TwitterEmbed {...(node.fields as { url: string })} />,
    'github-gist': ({ node }: { node: BlockNode }) => (
      <GitHubGistEmbed {...(node.fields as { url: string })} />
    ),
    codepen: ({ node }: { node: BlockNode }) => (
      <CodePenEmbed
        {...(node.fields as { url: string; height?: number; defaultTab?: 'result' | 'html' | 'css' | 'js' })}
      />
    ),
    video: ({ node }: { node: BlockNode }) => (
      <VideoEmbed
        {...(node.fields as { url: string; caption?: string; autoplay?: boolean; loop?: boolean; muted?: boolean })}
      />
    ),
    callout: ({ node }: { node: BlockNode }) => (
      <CalloutBlock
        {...(node.fields as { type: 'info' | 'warning' | 'error' | 'success' | 'tip'; title?: string; content: string })}
      />
    ),
    divider: ({ node }: { node: BlockNode }) => (
      <DividerBlock {...(node.fields as { style?: 'line' | 'dots' | 'stars' | 'space' })} />
    ),
    bookmark: ({ node }: { node: BlockNode }) => (
      <BookmarkCard
        {...(node.fields as { url: string; title?: string; description?: string; thumbnail?: { url?: string } | string | null })}
      />
    ),
  },
})

export function PayloadRichText({ data }: Props) {
  if (!data) return null

  return <RichTextRenderer data={data as never} converters={jsxConverters} />
}
