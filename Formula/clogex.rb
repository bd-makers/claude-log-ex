class Clogex < Formula
  desc "TUI for exploring Claude Code session logs"
  homepage "https://github.com/bd-makers/claude-log-ex"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/bd-makers/claude-log-ex/releases/download/v#{version}/clogex-macos-arm64"
      sha256 "PLACEHOLDER_ARM64_SHA256"
    end
    on_intel do
      url "https://github.com/bd-makers/claude-log-ex/releases/download/v#{version}/clogex-macos-x86_64"
      sha256 "PLACEHOLDER_X86_64_SHA256"
    end
  end

  def install
    on_macos do
      on_arm do
        bin.install "clogex-macos-arm64" => "clogex"
      end
      on_intel do
        bin.install "clogex-macos-x86_64" => "clogex"
      end
    end
  end

  test do
    assert_match "Usage", shell_output("#{bin}/clogex --help 2>&1", 1)
  end
end
