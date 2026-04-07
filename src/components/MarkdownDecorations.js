/**
 * TipTap extension that shows markdown syntax characters (**, _, ~~, `)
 * around a mark ONLY when the cursor is inside that mark — Obsidian style.
 * Also shows link href decoration when cursor is inside a link.
 */
import { Extension, getMarkRange } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { DecorationSet, Decoration } from '@tiptap/pm/view'

const MARK_SYNTAX = {
  bold:   { open: '**', close: '**' },
  italic: { open: '_',  close: '_'  },
  strike: { open: '~~', close: '~~' },
  code:   { open: '`',  close: '`'  },
}

function makeSyntaxNode(text, extraClass) {
  const span = document.createElement('span')
  span.className = extraClass ? `md-syntax ${extraClass}` : 'md-syntax'
  span.textContent = text
  return span
}

const decorationsKey = new PluginKey('markdownDecorations')

export const MarkdownDecorations = Extension.create({
  name: 'markdownDecorations',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: decorationsKey,

        state: {
          init() {
            return DecorationSet.empty
          },

          apply(tr, _prev, _oldState, newState) {
            // Only recompute when doc or selection changes
            if (!tr.docChanged && !tr.selectionSet) return _prev

            const { selection, doc, schema } = newState
            // Only show decorations for cursor (collapsed) selection
            if (!selection.empty) return DecorationSet.empty

            const $cursor = selection.$from
            const decos = []

            // Standard mark decorations (bold, italic, strike, code)
            for (const [markName, syntax] of Object.entries(MARK_SYNTAX)) {
              const markType = schema.marks[markName]
              if (!markType) continue

              const range = getMarkRange($cursor, markType)
              if (!range) continue

              decos.push(
                Decoration.widget(range.from, () => makeSyntaxNode(syntax.open),  { side: -1, key: `${markName}-open`  }),
                Decoration.widget(range.to,   () => makeSyntaxNode(syntax.close), { side:  1, key: `${markName}-close` }),
              )
            }

            // Link mark decoration — show href
            const linkMarkType = schema.marks['link']
            if (linkMarkType) {
              const range = getMarkRange($cursor, linkMarkType)
              if (range) {
                // Get href from the mark attrs
                let href = ''
                doc.nodesBetween(range.from, range.to, (node) => {
                  const mark = node.marks.find((m) => m.type === linkMarkType)
                  if (mark) href = mark.attrs.href || ''
                })
                const openText = href ? `<${href}>` : '<link>'
                decos.push(
                  Decoration.widget(range.from, () => makeSyntaxNode(openText, 'md-syntax--link'), { side: -1, key: 'link-open' }),
                  Decoration.widget(range.to,   () => makeSyntaxNode('</link>', 'md-syntax--link'), { side: 1, key: 'link-close' }),
                )
              }
            }

            return DecorationSet.create(doc, decos)
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
