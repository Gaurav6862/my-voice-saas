"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Usage {
  id: string;
  text: string;
  created_at: string;
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<Usage[]>([]);

  useEffect(() => {
    const fetchUsage = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: _data, error } = await supabase
        .from("usage_logs")
        .select("*");
      if (_data) setUsage(_data as Usage[]);
    };
    fetchUsage();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <ul className="mt-4">
        {usage.map((item) => (
          <li key={item.id}>
            {item.text} - {item.created_at}
          </li>
        ))}
      </ul>
    </div>
  );
}
