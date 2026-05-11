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
import { styled } from '@superset-ui/core';
import { HelloWorldProps, HelloWorldStylesProps } from './types';

const Styles = styled.div<HelloWorldStylesProps>`
  padding: ${({ theme }) => theme.gridUnit * 4}px;
  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  overflow: auto;
  font-family: ${({ theme }) => theme.typography.families.sansSerif};

  h1 {
    margin: 0 0 ${({ theme }) => theme.gridUnit * 3}px 0;
    font-size: ${({ theme }) => theme.typography.sizes.xxl}px;
    font-weight: ${({ boldText }) => (boldText ? 700 : 400)};
    text-align: center;
  }

  .wave-image {
    display: block;
    margin: 0 auto ${({ theme }) => theme.gridUnit * 3}px;
    font-size: 64px;
    text-align: center;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: ${({ theme }) => theme.typography.sizes.m}px;
  }

  thead th {
    background-color: ${({ theme }) => theme.colors.grayscale.light4};
    color: ${({ theme }) => theme.colors.grayscale.dark2};
    text-align: left;
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border-bottom: 2px solid ${({ theme }) => theme.colors.grayscale.light2};
    white-space: nowrap;
  }

  tbody td {
    padding: ${({ theme }) => theme.gridUnit * 2}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grayscale.light3};
  }

  tbody tr:hover {
    background-color: ${({ theme }) => theme.colors.grayscale.light5};
  }
`;

export default function HelloWorld(props: HelloWorldProps) {
  const { data, height, width } = props;

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Styles boldText={props.boldText} headerFontSize="xs" height={height} width={width}>
      <h1>Hello World</h1>
      <div className="wave-image" role="img" aria-label="Person waving">
        👋🧑
      </div>
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>{row[col] != null ? String(row[col]) : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Styles>
  );
}
