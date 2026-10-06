'use client'

import { useLayoutEffect, useRef } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { FieldError, useField } from '@payloadcms/ui'

/**
 * The post title as a borderless, auto-growing headline (like Ghost's editor), so long
 * titles wrap instead of scrolling inside a single-line input. Enter jumps to the body.
 */
export const PostTitleField: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError } = useField<string>({ path })
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="post-title-field">
      <FieldError path={path} showError={showError} />
      <textarea
        ref={ref}
        id={`field-${path}`}
        className="post-title-field__input"
        rows={1}
        value={value ?? ''}
        placeholder={(field.admin?.placeholder as string) ?? 'Post title'}
        aria-label="Title"
        onChange={(e) => setValue(e.target.value.replace(/\n/g, ' '))}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          document.querySelector<HTMLElement>('.rich-text-lexical [contenteditable="true"]')?.focus()
        }}
      />
    </div>
  )
}
