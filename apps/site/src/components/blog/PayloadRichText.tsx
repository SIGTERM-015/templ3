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

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    youtube: ({ node }) => <YouTubeEmbed {...(node.fields as { url: string; caption?: string })} />,
    spotify: ({ node }) => (
      <SpotifyEmbed {...(node.fields as { url: string; height?: 'compact' | 'large' })} />
    ),
    twitter: ({ node }) => <TwitterEmbed {...(node.fields as { url: string })} />,
    'github-gist': ({ node }) => <GitHubGistEmbed {...(node.fields as { url: string })} />,
    codepen: ({ node }) => (
      <CodePenEmbed
        {...(node.fields as { url: string; height?: number; defaultTab?: 'result' | 'html' | 'css' | 'js' })}
      />
    ),
    video: ({ node }) => (
      <VideoEmbed
        {...(node.fields as { url: string; caption?: string; autoplay?: boolean; loop?: boolean; muted?: boolean })}
      />
    ),
    callout: ({ node }) => (
      <CalloutBlock
        {...(node.fields as { type: 'info' | 'warning' | 'error' | 'success' | 'tip'; title?: string; content: string })}
      />
    ),
    divider: ({ node }) => (
      <DividerBlock {...(node.fields as { style?: 'line' | 'dots' | 'stars' | 'space' })} />
    ),
    bookmark: ({ node }) => (
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
