/**
 * TipTap extension that shows markdown syntax characters (**, _, ~~, `)
 * around a mark ONLY when the cursor is inside that mark — Obsidian style.
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

function makeSyntaxNode(text) {
  const span = document.createElement('span')
  span.className = 'md-syntax'
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
