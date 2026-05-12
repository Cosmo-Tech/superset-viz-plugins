/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { CSSProperties } from 'react';
import { HelloWorldProps } from './types';

/**
 * Font size mapping for the header_font_size control panel selector.
 * These values are independent of the Superset theme to avoid compatibility
 * issues between @superset-ui/core versions and Superset runtime.
 */
const FONT_SIZES: Record<string, number> = {
  xxs: 9,
  xs: 10,
  s: 12,
  m: 14,
  l: 16,
  xl: 20,
  xxl: 28,
};

const styles: Record<string, CSSProperties> = {
  container: {
    padding: 16,
    borderRadius: 8,
    overflow: 'auto',
    fontFamily: "'Inter', Helvetica, Arial, sans-serif",
  },
  heading: {
    margin: '0 0 16px 0',
    textAlign: 'center',
  },
  wave: {
    display: 'block',
    margin: '0 auto 16px',
    fontSize: 64,
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    backgroundColor: '#f0f0f0',
    color: '#262626',
    textAlign: 'left',
    padding: 12,
    borderBottom: '2px solid #d9d9d9',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: 12,
    borderBottom: '1px solid #f0f0f0',
  },
  trHover: {
    backgroundColor: '#fafafa',
  },
};

export default function HelloWorld(props: HelloWorldProps) {
  const { data, height, width, boldText, headerFontSize } = props;

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const headingFontSize = FONT_SIZES[headerFontSize] || FONT_SIZES.xl;

  return (
    <div style={{ ...styles.container, height, width }}>
      <h1
        style={{
          ...styles.heading,
          fontSize: headingFontSize,
          fontWeight: boldText ? 700 : 400,
        }}
      >
        Hello World
      </h1>
      <div style={styles.wave} role="img" aria-label="Person waving">
        👋🧑
      </div>
      {data.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={styles.th}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col} style={styles.td}>
                    {row[col] != null ? String(row[col]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
