import React from 'react';
import CountUp from 'react-countup';

interface CountUpNumberProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function CountUpNumber({ 
  end, 
  duration = 2, 
  prefix = '', 
  suffix = '', 
  className = '',
  decimals = 2
}: CountUpNumberProps) {
  return (
    <CountUp
      end={end}
      duration={duration}
      separator=","
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  );
}
