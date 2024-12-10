import { CircularProgress, Typography } from '@mui/material';
import { MarkdownPreview } from 'src/renderer/components/MarkdownPreview/MarkdownPreview';

interface Props {
    markdownLoading: boolean;
    markdown?: string;
}

export function MarketplaceItemInfo(props: Props) {
    return (
        <>
            {props.markdownLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
                    {props.markdown ? (
                        <MarkdownPreview
                            source={props.markdown}
                            style={{ background: 'transparent', padding: '0 21px' }}
                            // wrapperElement={{
                            //     'data-color-mode': 'dark',
                            // }}
                            disableLeftLinkIcon
                        />
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Typography>{'No Information (README.md missing)'}</Typography>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
