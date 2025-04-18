import { InputRule, mergeAttributes } from '@tiptap/core'
import { mergeCSSClasses } from '../../../../../../shared/utils'
import { createTipTapBlock } from '../../../../api/block'
import styles from '../../../Block.module.css'
import handleEnter from '../ListItemKeyboardShortcuts'

const BulletListItemBlockContent = createTipTapBlock<'bulletListItem'>({
  name: 'bulletListItem',
  content: 'inline*',

  addInputRules() {
    return [
      // Creates an unordered list when starting with "-", "+", or "*".
      new InputRule({
        find: /^[-+*]\\s$/,
        handler: ({ state, chain, range }) => {
          chain()
            .BNUpdateBlock(state.selection.from, {
              type: 'bulletListItem',
              props: {},
            })
            // Removes the "-", "+", or "*" character used to set the list.
            .deleteRange({ from: range.from, to: range.to })
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => handleEnter(this.editor),
    }
  },

  parseHTML() {
    return [
      // Case for regular HTML list structure.
      {
        tag: 'li',
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }

          const parent = element.parentElement

          if (parent === null) {
            return false
          }

          if (parent.tagName === 'UL') {
            return {}
          }

          return false
        },
        node: 'bulletListItem',
      },
      // Case for BlockNote list structure.
      {
        tag: 'p',
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false
          }

          const parent = element.parentElement

          if (parent === null) {
            return false
          }

          if (parent.getAttribute('data-content-type') === 'bulletListItem') {
            return {}
          }

          return false
        },
        priority: 300,
        node: 'bulletListItem',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const blockContentDOMAttributes = this.options.domAttributes?.blockContent || {}
    const inlineContentDOMAttributes = this.options.domAttributes?.inlineContent || {}

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: mergeCSSClasses(styles.blockContent, blockContentDOMAttributes.class),
        'data-content-type': this.name,
      }),
      [
        'p',
        {
          class: mergeCSSClasses(styles.inlineContent, inlineContentDOMAttributes.class),
        },
        0,
      ],
    ]
  },
})

export default BulletListItemBlockContent
