import MarkdownPreviewRaw, { MarkdownPreviewProps, MarkdownPreviewRef } from '@uiw/react-markdown-preview';
import { Element } from 'hast';
import { RefAttributes } from 'react';

interface Props extends MarkdownPreviewProps, RefAttributes<MarkdownPreviewRef> {
    disableLeftLinkIcon?: boolean;
}

export function MarkdownPreview(props: Props) {
    return (
        <MarkdownPreviewRaw
            rehypeRewrite={(node: Element, index, parent: Element) => {
                if (
                    props.disableLeftLinkIcon &&
                    node.tagName === 'a' &&
                    parent &&
                    /^h(1|2|3|4|5|6)/.test(parent.tagName)
                ) {
                    parent.children = parent.children.slice(1);
                }
                if (node.tagName === 'a') {
                    if (!node.properties.href.toString().startsWith('#')) {
                        node.properties.target = '_blank';
                    }
                }
                if (node.tagName === 'pre') {
                    node.properties.style = 'display:grid;';
                }
            }}
            {...props}
        />
    );
}
