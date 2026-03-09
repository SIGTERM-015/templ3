import type { Block } from 'payload'

export const YouTubeBlock: Block = {
  slug: 'youtube',
  labels: {
    singular: 'YouTube Video',
    plural: 'YouTube Videos',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://www.youtube.com/watch?v=... or https://youtu.be/...',
        description: 'Paste the YouTube video URL',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption below the video',
      },
    },
  ],
}

export const SpotifyBlock: Block = {
  slug: 'spotify',
  labels: {
    singular: 'Spotify Embed',
    plural: 'Spotify Embeds',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://open.spotify.com/track/... or /album/... or /playlist/...',
        description: 'Paste the Spotify URL (track, album, playlist, or episode)',
      },
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'compact',
      options: [
        { label: 'Compact (152px)', value: 'compact' },
        { label: 'Large (352px)', value: 'large' },
      ],
      admin: {
        description: 'Widget size',
      },
    },
  ],
}

export const TwitterBlock: Block = {
  slug: 'twitter',
  labels: {
    singular: 'Twitter/X Post',
    plural: 'Twitter/X Posts',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://twitter.com/user/status/... or https://x.com/user/status/...',
        description: 'Paste the tweet URL',
      },
    },
  ],
}

export const GitHubGistBlock: Block = {
  slug: 'github-gist',
  labels: {
    singular: 'GitHub Gist',
    plural: 'GitHub Gists',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://gist.github.com/username/gist-id',
        description: 'Paste the GitHub Gist URL',
      },
    },
  ],
}

export const CodePenBlock: Block = {
  slug: 'codepen',
  labels: {
    singular: 'CodePen',
    plural: 'CodePens',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://codepen.io/username/pen/pen-id',
        description: 'Paste the CodePen URL',
      },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
      admin: {
        description: 'Height in pixels',
      },
    },
    {
      name: 'defaultTab',
      type: 'select',
      defaultValue: 'result',
      options: [
        { label: 'Result', value: 'result' },
        { label: 'HTML', value: 'html' },
        { label: 'CSS', value: 'css' },
        { label: 'JS', value: 'js' },
      ],
    },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: {
    singular: 'Video File',
    plural: 'Video Files',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://example.com/video.mp4',
        description: 'Direct URL to the video file (MP4, WebM)',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'muted',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Required for autoplay in most browsers',
      },
    },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: {
    singular: 'Callout',
    plural: 'Callouts',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'info',
      required: true,
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
        { label: 'Success', value: 'success' },
        { label: 'Tip', value: 'tip' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title for the callout',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
}

export const DividerBlock: Block = {
  slug: 'divider',
  labels: {
    singular: 'Divider',
    plural: 'Dividers',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      defaultValue: 'line',
      options: [
        { label: 'Line', value: 'line' },
        { label: 'Dots', value: 'dots' },
        { label: 'Stars', value: 'stars' },
        { label: 'Space', value: 'space' },
      ],
    },
  ],
}

export const BookmarkBlock: Block = {
  slug: 'bookmark',
  labels: {
    singular: 'Bookmark Card',
    plural: 'Bookmark Cards',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'https://example.com/article',
        description: 'URL to create a bookmark card for',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Override the page title (optional)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Override the page description (optional)',
      },
    },
    {
      name: 'thumbnail',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Override the thumbnail image (optional)',
      },
    },
  ],
}
