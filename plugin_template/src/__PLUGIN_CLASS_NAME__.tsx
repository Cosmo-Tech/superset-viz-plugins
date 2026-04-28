import { {{PLUGIN_CLASS_NAME}}Props } from './types';

export default function {{PLUGIN_CLASS_NAME}}({ data, height, width }: {{PLUGIN_CLASS_NAME}}Props) {
  return (
    <div style={{ height, width, overflow: 'auto' }}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
