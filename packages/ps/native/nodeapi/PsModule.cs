using Microsoft.JavaScript.NodeApi;
using System;
using System.IO;

namespace SysUtils.Ps;

[JSExport]
public static class PsModule
{
    [JSExport]
    public static string ListProcesses(string fields)
    {
        var opts = string.IsNullOrEmpty(fields)
            ? Options.Parse(Array.Empty<string>())
            : Options.Parse(new[] { "--fields", fields });
        using var writer = new StringWriter();

        if (OperatingSystem.IsWindows())
            WindowsReader.Write(writer, opts.Fields);
        else if (OperatingSystem.IsLinux())
            LinuxReader.Write(writer, opts.Fields);
        else if (OperatingSystem.IsMacOS())
            MacReader.Write(writer, opts.Fields);
        else
            throw new PlatformNotSupportedException();

        return writer.ToString();
    }
}
