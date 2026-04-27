class Clogex < Formula
  desc "TUI for exploring Claude Code session logs"
  homepage "https://github.com/bd-makers/claude-log-ex"
  version "0.1.2"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/bd-makers/claude-log-ex/releases/download/v#{version}/clogex-macos-arm64"
      sha256 "710c5b050a4f0ef04fa56d116ba559f4e3e3b451f16ba16b9a202a16ddb5cbb8"
    end
  end

  def install
    bin.install "clogex-macos-arm64" => "clogex"
  end

  test do
    assert_match "Usage", shell_output("#{bin}/clogex --help 2>&1", 1)
  end
end
