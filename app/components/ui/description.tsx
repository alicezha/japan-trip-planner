import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Description = ({ content }: { content: string }) => {
	return (
		<p className="text-sm text-gray-400 mt-2 prose lg:prose-md sm:prose-xs">
			<Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
		</p>
	);
};
